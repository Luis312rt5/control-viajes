import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TripsClientService } from './trips-client.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TRIPS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('TRIPS_SERVICE_HOST', 'trips-service'),
            port: parseInt(config.get('TRIPS_SERVICE_PORT', '3001'), 10),
          },
        }),
      },
    ]),
  ],
  providers: [TripsClientService],
  exports: [TripsClientService],
})
export class TripsClientModule {}
