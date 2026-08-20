import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      {
        name: 'OPERATIONS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('OPERATIONS_SERVICE_HOST', 'operations-service'),
            port: parseInt(config.get('OPERATIONS_SERVICE_PORT', '3002'), 10),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesClientsModule {}
