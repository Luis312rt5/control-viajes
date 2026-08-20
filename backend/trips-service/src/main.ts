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
        port: parseInt(process.env.PORT || '3001', 10),
      },
    },
  );
  // Nota: no se aplica ValidationPipe aquí a propósito. La validación de
  // entrada (DTOs con class-validator) ya ocurre en el gateway, que es el
  // único punto de entrada público. Los microservicios internos confían en
  // los datos que reciben del gateway por la red interna de Docker.
  await app.listen();
  console.log(`trips-service escuchando en puerto ${process.env.PORT || 3001}`);
}
bootstrap();
