import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripsClientService } from './trips-client.service';

@Module({
  imports: [ConfigModule],
  providers: [TripsClientService],
  exports: [TripsClientService],
})
export class TripsClientModule {}
