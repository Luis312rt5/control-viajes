import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Incident } from './entities/incident.entity';
import { ExpensesModule } from './expenses/expenses.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Ver comentario equivalente en trips-service/src/app.module.ts:
        // DATABASE_URL tiene prioridad para poder reutilizar una base
        // Postgres existente (el plan free de Render solo permite una).
        const databaseUrl = config.get<string>('DATABASE_URL');
        const base = databaseUrl
          ? { url: databaseUrl }
          : {
              host: config.get('DB_HOST', 'localhost'),
              port: parseInt(config.get('DB_PORT', '5432'), 10),
              username: config.get('DB_USER', 'postgres'),
              password: config.get('DB_PASSWORD', 'postgres'),
              database: config.get('DB_NAME', 'operations_db'),
            };
        return {
          type: 'postgres' as const,
          ...base,
          schema: config.get('DB_SCHEMA', 'viajes'),
          ssl: databaseUrl ? { rejectUnauthorized: false } : false,
          entities: [Expense, Incident],
          synchronize: true,
        };
      },
    }),
    ExpensesModule,
    IncidentsModule,
  ],
})
export class AppModule {}
