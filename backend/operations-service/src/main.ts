import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
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
