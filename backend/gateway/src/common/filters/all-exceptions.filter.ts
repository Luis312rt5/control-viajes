import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Excepciones HTTP normales (BadRequestException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return response.status(status).json(
        typeof body === 'string'
          ? { statusCode: status, message: body }
          : { statusCode: status, ...(body as object) },
      );
    }

    // Errores que vienen serializados desde los microservicios por TCP.
    // NestJS microservices envía { message, status: 'error' } para HttpException
    // reconocidas (BadRequestException, NotFoundException, etc.) y también para
    // errores no controlados (con mensaje genérico "Internal server error").
    if (exception?.status === 'error' && exception?.message) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    }

    // Variante con statusCode explícito (por si acaso)
    if (exception?.statusCode && exception?.message) {
      return response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
      });
    }

    // Timeout de comunicación con un microservicio
    if (exception?.name === 'TimeoutError') {
      return response.status(HttpStatus.GATEWAY_TIMEOUT).json({
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: 'Uno de los servicios internos no respondió a tiempo',
      });
    }

    console.error('Error no controlado:', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    });
  }
}
