/**
 * Cliente HTTP base para hablar con los microservicios internos
 * (trips-service, operations-service). Reemplaza al ClientProxy TCP de
 * @nestjs/microservices: Render Free no permite tráfico de red privada
 * entrante entre servicios, así que gateway ↔ microservicios ahora se
 * comunican por HTTP normal, protegido con un header compartido
 * (INTERNAL_API_KEY) para que no cualquiera pueda invocar estas rutas
 * "internas" aunque queden públicamente alcanzables.
 *
 * Reproduce el comportamiento previo (timeout, errores mapeados a
 * {statusCode, message} o {name: 'TimeoutError'}) para que
 * AllExceptionsFilter siga funcionando sin cambios.
 *
 * Timeout por defecto: 20s en vez de los 5s originales. En el plan Free de
 * Render, un servicio sin tráfico en 15 min se "duerme" y tarda hasta ~50s
 * en volver a responder al primer request — con 5s, esa primera llamada
 * (p. ej. el primer login del día) fallaría por timeout aunque el servicio
 * esté sano, solo dormido.
 */
export class InternalHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly internalKey: string,
    private readonly timeoutMs = 20000,
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': this.internalKey,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw { name: 'TimeoutError' };
      }
      throw {
        statusCode: 502,
        message: 'No se pudo conectar con un servicio interno',
      };
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw {
        statusCode: (data && data.statusCode) || response.status,
        message: (data && data.message) || 'Error en un servicio interno',
      };
    }

    return data as T;
  }

  protected get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    const entries = Object.entries(query ?? {}).filter(
      ([, v]) => v !== undefined && v !== null,
    );
    const qs = entries.length
      ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}`
      : '';
    return this.request<T>('GET', `${path}${qs}`);
  }

  protected post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  protected patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }
}
