export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PROFESSOR: 'PROFESSOR',
  STUDENT: 'STUDENT',
} as const;

export const ADMIN_ROLE_CODES: readonly string[] = [
  ROLE_CODES.ADMIN,
  ROLE_CODES.SUPER_ADMIN,
];
