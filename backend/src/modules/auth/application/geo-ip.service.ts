import { Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';

@Injectable()
export class GeoIpService {
  private readonly logger = new Logger(GeoIpService.name);

  resolve(ipAddress: string): {
    latitude: number;
    longitude: number;
    city: string | null;
    country: string | null;
  } | null {
    const ip = this.normalizeIp(ipAddress);
    if (!ip) {
      if (process.env.MOCK_GEO_ENABLED === 'true') {
        const mockLat = parseFloat(process.env.MOCK_GEO_LAT || '0');
        const mockLon = parseFloat(process.env.MOCK_GEO_LON || '0');
        
        this.logger.debug(
          `Local IP detected. Using .env MOCK coordinates: [${mockLat}, ${mockLon}]`,
        );
        return {
          latitude: mockLat,
          longitude: mockLon,
          city: 'Mock City',
          country: 'Mock Country',
        };
      }
      return null;
    }

    try {
      const geo = geoip.lookup(ip);

      if (!geo) {
        return null;
      }

      const [latitude, longitude] = geo.ll;

      return {
        latitude,
        longitude,
        city: geo.city || null,
        country: geo.country || null,
      };
    } catch (error) {
      this.logger.warn({
        level: 'warn',
        context: GeoIpService.name,
        message: 'GeoIP lookup failed',
        ip,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private normalizeIp(ipAddress: string): string | null {
    const trimmed = ipAddress.trim();
    if (!trimmed || trimmed === '0.0.0.0' || trimmed === '::1') {
      return null;
    }

    if (trimmed.startsWith('::ffff:')) {
      return trimmed.slice(7);
    }

    return trimmed;
  }
}

