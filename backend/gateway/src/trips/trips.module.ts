import { Module } from '@nestjs/common';
import { MicroservicesClientsModule } from '../microservices-clients.module';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';

@Module({
  imports: [MicroservicesClientsModule],
  providers: [TripsService],
  controllers: [TripsController],
})
export class TripsModule {}
