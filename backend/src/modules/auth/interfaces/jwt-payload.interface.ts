export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  activeRole: string;
  sessionId: string;
  deviceId: string;
  iat?: number;
  exp?: number;
}
