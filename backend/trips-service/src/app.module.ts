import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Trip } from './entities/trip.entity';
import { Passenger } from './entities/passenger.entity';
import { UsersModule } from './users/users.module';
import { TripsModule } from './trips/trips.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'trips_db'),
        entities: [User, Trip, Passenger],
        synchronize: true, // OK para prueba técnica; en prod usar migrations
      }),
    }),
    UsersModule,
    TripsModule,
    SeedModule,
  ],
})
export class AppModule {}
