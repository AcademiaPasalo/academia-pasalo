export interface DatabaseError {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  sqlState?: string;
  driverError?: DatabaseError;
}

export enum MySqlErrorCode {
  DUPLICATE_ENTRY = 1062,
  FOREIGN_KEY_CONSTRAINT_FAIL = 1451,
  NOT_NULL_CONSTRAINT_FAIL = 1048,
  DEADLOCK = 1213,
  LOCK_WAIT_TIMEOUT = 1205,
}
