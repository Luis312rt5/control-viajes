import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { OperationsModule } from './operations/operations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TripsModule,
    OperationsModule,
    UsersModule,
  ],
})
export class AppModule {}
