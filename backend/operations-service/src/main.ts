import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from './app.module';

// Ver comentario equivalente en trips-service/src/main.ts: TypeORM no crea
// el esquema Postgres por sí solo, solo las tablas dentro de uno que ya
// exista.
async function ensureSchemaExists() {
  const schema = process.env.DB_SCHEMA || 'viajes';
  const databaseUrl = process.env.DATABASE_URL;
  const client = databaseUrl
    ? new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
    : new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'operations_db',
      });
  await client.connect();
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await client.end();
}

async function bootstrap() {
  await ensureSchemaExists();
  const app = await NestFactory.create(AppModule);

  // Igual que en trips-service: la validación de entrada ya ocurre en el
  // gateway. Este servicio dejó de ser un microservicio TCP puro (Render
  // Free no permite tráfico de red privada entrante entre servicios), así
  // que ahora es HTTP normal protegido con un header compartido.
  const internalKey =
    process.env.INTERNAL_API_KEY || 'dev_internal_key_change_me';

  app.use((req: any, res: any, next: any) => {
    if (req.path === '/health') return next();
    if (req.headers['x-internal-key'] !== internalKey) {
      return res.status(401).json({
        statusCode: 401,
        message: 'No autorizado (falta o es inválida x-internal-key)',
      });
    }
    next();
  });

  app.getHttpAdapter().get('/health', (_req: any, res: any) =>
    res.status(200).json({ status: 'ok', service: 'operations-service' }),
  );

  // Prefijo para dejar explícito que estas rutas son de uso interno
  // (gateway las llama con base URL .../internal).
  app.setGlobalPrefix('internal');

  const port = parseInt(process.env.PORT || '3002', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`operations-service escuchando en puerto ${port}`);
}
bootstrap();
