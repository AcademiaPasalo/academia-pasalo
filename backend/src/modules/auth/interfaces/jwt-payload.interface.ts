export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  activeRole: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}
