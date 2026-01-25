export interface NestErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}
