import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from './app.module';

// TypeORM (con synchronize: true) crea las TABLAS solo, pero no crea el
// ESQUEMA si no existe — y este servicio guarda sus tablas en un esquema
// propio ("viajes" por defecto, ver app.module.ts) para poder compartir una
// misma base Postgres con otro proyecto sin choque de nombres. Sin este
// paso, el primer arranque falla con "schema ... does not exist" y el
// proceso termina con exit code 1.
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
        database: process.env.DB_NAME || 'trips_db',
      });
  await client.connect();
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await client.end();
}

async function bootstrap() {
  await ensureSchemaExists();
  const app = await NestFactory.create(AppModule);

  // Nota: no se aplica ValidationPipe aquí a propósito. La validación de
  // entrada (DTOs con class-validator) ya ocurre en el gateway, que es el
  // único punto de entrada público.
  //
  // Este servicio ya no habla TCP puro (Render Free no permite tráfico de
  // red privada entrante entre servicios, así que la comunicación entre
  // microservicios pasa a ser HTTP normal). Como ahora es un servidor HTTP
  // que puede quedar accesible por su URL pública en Render, protegemos
  // todas las rutas (excepto /health) con un header compartido para que
  // solo el gateway y operations-service puedan invocarlas.
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
    res.status(200).json({ status: 'ok', service: 'trips-service' }),
  );

  // Prefijo para dejar explícito que estas rutas son de uso interno
  // (gateway/operations-service las llaman con base URL .../internal).
  app.setGlobalPrefix('internal');

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`trips-service escuchando en puerto ${port}`);
}
bootstrap();
