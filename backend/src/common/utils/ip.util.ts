export function normalizeIpAddress(ip: string | undefined | null): string {
  if (!ip) {
    return '0.0.0.0';
  }

  const trimmed = ip.trim();
  if (!trimmed) {
    return '0.0.0.0';
  }

  if (trimmed === '::1') {
    return '127.0.0.1';
  }

  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice('::ffff:'.length);
  }

  return trimmed;
}
