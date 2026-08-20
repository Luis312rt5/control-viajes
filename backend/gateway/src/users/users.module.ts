import { Module } from '@nestjs/common';
import { MicroservicesClientsModule } from '../microservices-clients.module';
import { UsersController } from './users.controller';

@Module({
  imports: [MicroservicesClientsModule],
  controllers: [UsersController],
})
export class UsersModule {}
