import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { JWT, GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';

dotenvConfig();

type GroupMember = {
  email?: string;
  role?: string;
  status?: string;
};

async function getWorkspaceJwt(config: ConfigService): Promise<JWT> {
  const keyFile = config.get<string>('GOOGLE_APPLICATION_CREDENTIALS', '');
  const adminEmail = (config.get<string>('GOOGLE_WORKSPACE_ADMIN_EMAIL', '') || '').trim();
  if (!keyFile || !adminEmail) {
    throw new Error('Faltan GOOGLE_APPLICATION_CREDENTIALS o GOOGLE_WORKSPACE_ADMIN_EMAIL');
  }
  if (!fs.existsSync(keyFile)) {
    throw new Error(`No existe keyFile: ${keyFile}`);
  }

  const raw = await fs.promises.readFile(keyFile, 'utf8');
  const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Credenciales invalidas para Workspace');
  }

  const jwt = new JWT({
    email: parsed.client_email,
    key: parsed.private_key,
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.group',
      'https://www.googleapis.com/auth/admin.directory.group.member',
    ],
    subject: adminEmail,
  });
  await jwt.authorize();
  return jwt;
}

async function listGroupMembers(jwt: JWT, groupEmail: string): Promise<GroupMember[]> {
  const members: GroupMember[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ maxResults: '200' });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await jwt.request<{ members?: GroupMember[]; nextPageToken?: string }>({
      url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(groupEmail)}/members?${params.toString()}`,
      method: 'GET',
    });
    members.push(...(res.data.members || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return members;
}

async function getFileMeta(fileId: string): Promise<unknown> {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const client = await auth.getClient();
  const res = await client.request({
    url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true&fields=id,name,parents,driveId,permissions(id,type,role,emailAddress,domain,allowFileDiscovery),owners(emailAddress),sharingUser(emailAddress)`,
    method: 'GET',
  });
  return res.data;
}

async function main(): Promise<void> {
  const config = new ConfigService();
  const groupEmail = (process.argv[2] || 'ev-117-viewers@academiapasalo.com').trim().toLowerCase();
  const memberEmail = (process.argv[3] || 'a20192393@pucp.edu.pe').trim().toLowerCase();
  const docFileId = (process.argv[4] || '1d5E-Lz-cNr3FVWMIjRsRIJOTxHAE_yjL').trim();
  const videoFileId = (process.argv[5] || '1too7P5h4LbQIX2pPQDmZTjEbNXLCrZpT').trim();

  const jwt = await getWorkspaceJwt(config);
  const members = await listGroupMembers(jwt, groupEmail);
  const normalizedMembers = members
    .map((m) => ({
      email: (m.email || '').toLowerCase(),
      role: m.role || null,
      status: m.status || null,
    }))
    .filter((m) => m.email);

  const inGroup = normalizedMembers.some((m) => m.email === memberEmail);
  const docMeta = await getFileMeta(docFileId);
  const videoMeta = await getFileMeta(videoFileId);

  console.log(
    JSON.stringify(
      {
        groupEmail,
        memberEmail,
        inGroup,
        membersPreview: normalizedMembers.slice(0, 20),
        docMeta,
        videoMeta,
      },
      null,
      2,
    ),
  );
}

void main();
