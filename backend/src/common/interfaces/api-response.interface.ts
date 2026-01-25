export interface ApiResponse<T> {
  statusCode: number;
  message: string | string[];
  data: T;
  timestamp: string;
}
