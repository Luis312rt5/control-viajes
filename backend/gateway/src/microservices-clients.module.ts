import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripsServiceClient } from './clients/trips-service.client';
import { OperationsServiceClient } from './clients/operations-service.client';

// Nota: el nombre del archivo/módulo se conserva para minimizar cambios en
// los módulos que lo importan, pero ya no registra clientes TCP de
// @nestjs/microservices — ahora provee clientes HTTP hacia trips-service y
// operations-service (ver src/clients/). Motivo: Render Free no permite
// tráfico de red privada entrante entre servicios.
@Module({
  imports: [ConfigModule],
  providers: [TripsServiceClient, OperationsServiceClient],
  exports: [TripsServiceClient, OperationsServiceClient],
})
export class MicroservicesClientsModule {}
