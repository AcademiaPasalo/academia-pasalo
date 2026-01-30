import { Module, Global } from '@nestjs/common';
import { GeoProvider } from '@common/interfaces/geo-provider.interface';
import { GeoIpLiteService } from './geoip-lite.service';

@Global()
@Module({
  providers: [
    {
      provide: GeoProvider,
      useClass: GeoIpLiteService,
    },
  ],
  exports: [GeoProvider],
})
export class GeoModule {}
