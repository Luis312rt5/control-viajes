import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TripsClientService {
  private readonly baseUrl: string;
  private readonly internalKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get(
      'TRIPS_SERVICE_URL',
      'http://localhost:3001/internal',
    );
    this.internalKey = this.config.get(
      'INTERNAL_API_KEY',
      'dev_internal_key_change_me',
    );
  }

  /**
   * Comunicación inter-microservicio: operations-service pregunta a
   * trips-service (por HTTP, ver nota en main.ts) si el viaje existe y está
   * "in_progress" antes de aceptar un gasto o novedad (lógica transaccional
   * del negocio).
   */
  async assertTripInProgress(tripId: string): Promise<void> {
    const controller = new AbortController();
    // 20s: en el plan Free de Render un servicio dormido por inactividad
    // puede tardar hasta ~50s en responder al primer request (ver nota en
    // InternalHttpClient del gateway).
    const timer = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/trips/${tripId}/status`, {
        headers: { 'x-internal-key': this.internalKey },
        signal: controller.signal,
      });
    } catch {
      throw new BadRequestException(
        'No se pudo verificar el estado del viaje (trips-service no responde)',
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new BadRequestException(
        'No se pudo verificar el estado del viaje (trips-service no responde)',
      );
    }

    const result = (await response.json()) as { status: string };
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
