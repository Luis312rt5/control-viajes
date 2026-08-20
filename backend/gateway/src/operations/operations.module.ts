import { Module } from '@nestjs/common';
import { MicroservicesClientsModule } from '../microservices-clients.module';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';

@Module({
  imports: [MicroservicesClientsModule],
  providers: [OperationsService],
  controllers: [OperationsController],
})
export class OperationsModule {}
