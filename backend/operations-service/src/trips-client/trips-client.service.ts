import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class TripsClientService {
  constructor(
    @Inject('TRIPS_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Comunicación inter-microservicio: operations-service pregunta a
   * trips-service si el viaje existe y está "in_progress" antes de
   * aceptar un gasto o novedad (lógica transaccional del negocio).
   */
  async assertTripInProgress(tripId: string): Promise<void> {
    const result = await firstValueFrom(
      this.client.send<{ status: string }>('trips.getStatus', { tripId }).pipe(
        timeout(5000),
        catchError(() => {
          throw new BadRequestException(
            'No se pudo verificar el estado del viaje (trips-service no responde)',
          );
        }),
      ),
    );

    if (!result) {
      throw new BadRequestException('Viaje no encontrado');
    }
    if (result.status !== 'in_progress') {
      throw new BadRequestException(
        `No se puede registrar: el viaje no está en curso (estado actual: ${result.status})`,
      );
    }
  }
}
