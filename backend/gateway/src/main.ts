import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true });

  // Límite por defecto de Express es muy pequeño (100kb) y la firma digital
  // viaja como imagen base64 en el body — se sube el límite a 5mb.
  app.use(json({ limit: '5mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Sin prefijo /api, para el health check de Render (ver render.yaml).
  app.getHttpAdapter().get('/health', (_req, res) =>
    res.status(200).json({ status: 'ok', service: 'gateway' }),
  );

  app.setGlobalPrefix('api');

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`Gateway escuchando en http://localhost:${port}/api`);
}
bootstrap();
