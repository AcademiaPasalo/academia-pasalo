export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
}

export abstract class GeoProvider {
  abstract resolve(ipAddress: string): GeoLocationResult | null;
}
