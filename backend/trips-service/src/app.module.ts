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
      useFactory: (config: ConfigService) => {
        // Si DATABASE_URL está presente (útil cuando se reutiliza una base
        // Postgres ya existente en Render en vez de crear una nueva, dado
        // que el plan free solo permite una base activa por cuenta), se usa
        // esa cadena de conexión completa. Si no, se arma con las variables
        // sueltas (DB_HOST, DB_PORT, etc.), como en docker-compose local.
        const databaseUrl = config.get<string>('DATABASE_URL');
        const base = databaseUrl
          ? { url: databaseUrl }
          : {
              host: config.get('DB_HOST', 'localhost'),
              port: parseInt(config.get('DB_PORT', '5432'), 10),
              username: config.get('DB_USER', 'postgres'),
              password: config.get('DB_PASSWORD', 'postgres'),
              database: config.get('DB_NAME', 'trips_db'),
            };
        return {
          type: 'postgres' as const,
          ...base,
          // Esquema dedicado: permite compartir una misma base Postgres con
          // otro proyecto sin riesgo de choque de nombres de tabla.
          schema: config.get('DB_SCHEMA', 'viajes'),
          ssl: databaseUrl ? { rejectUnauthorized: false } : false,
          entities: [User, Trip, Passenger],
          synchronize: true, // OK para prueba técnica; en prod usar migrations
        };
      },
    }),
    UsersModule,
    TripsModule,
    SeedModule,
  ],
})
export class AppModule {}
