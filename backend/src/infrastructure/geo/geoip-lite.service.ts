import { Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import {
  GeoProvider,
  GeoLocationResult,
} from '@common/interfaces/geo-provider.interface';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class GeoIpLiteService implements GeoProvider {
  private readonly logger = new Logger(GeoIpLiteService.name);

  resolve(ipAddress: string): GeoLocationResult | null {
    const ip = this.normalizeIp(ipAddress);
    if (!ip) {
      if (technicalSettings.geo.mockGeoEnabled) {
        const mockLat = parseFloat(
          process.env.MOCK_GEO_LAT || technicalSettings.geo.mockGeoDefaultLat,
        );
        const mockLon = parseFloat(
          process.env.MOCK_GEO_LON || technicalSettings.geo.mockGeoDefaultLon,
        );

        this.logger.debug({
          level: 'debug',
          context: GeoIpLiteService.name,
          message: 'IP local detectada. Usando coordenadas MOCK.',
          latitude: mockLat,
          longitude: mockLon,
        });
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
        context: GeoIpLiteService.name,
        message: 'Fallo en la búsqueda de GeoIP',
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
