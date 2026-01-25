export interface RequestMetadata {
  ipAddress: string;
  userAgent: string;
  deviceId: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}
