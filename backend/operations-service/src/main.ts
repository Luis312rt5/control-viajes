import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(process.env.PORT || '3002', 10),
      },
    },
  );
  // Igual que en trips-service: la validación ya ocurre en el gateway.
  await app.listen();
  console.log(
    `operations-service escuchando en puerto ${process.env.PORT || 3002}`,
  );
}
bootstrap();
