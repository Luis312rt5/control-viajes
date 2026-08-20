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
 *
 * Reintento en frío: mientras un servicio Free está "despertando", a veces
 * la primera respuesta que llega no es la de la app (es una página HTML de
 * espera de la infraestructura), así que el body no es JSON válido. Antes
 * eso tiraba un SyntaxError sin manejar que terminaba como 500 genérico sin
 * explicación. Ahora, si el body no parsea como JSON, se espera un poco y
 * se reintenta una vez (tiempo típico de arranque en frío) antes de
 * reportar el error.
 */
const COLD_START_RETRY_DELAY_MS = 4000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export class InternalHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly internalKey: string,
    private readonly timeoutMs = 20000,
  ) {}

  private async fetchOnce(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<{ status: number; ok: boolean; rawText: string }> {
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

    const rawText = await response.text();
    return { status: response.status, ok: response.ok, rawText };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    let result = await this.fetchOnce(method, path, body);
    let data = result.rawText ? tryParseJson(result.rawText) : null;

    if (result.rawText && data === undefined) {
      // Probable arranque en frío: lo que llegó no fue JSON. Se reintenta
      // una vez, dándole tiempo al servicio a terminar de arrancar.
      await delay(COLD_START_RETRY_DELAY_MS);
      result = await this.fetchOnce(method, path, body);
      data = result.rawText ? tryParseJson(result.rawText) : null;
    }

    if (result.rawText && data === undefined) {
      // Ni el reintento devolvió JSON válido: error claro en vez de un
      // SyntaxError sin manejar.
      throw {
        statusCode: 503,
        message:
          'El servicio interno está iniciando, por favor intenta de nuevo en unos segundos',
      };
    }

    if (!result.ok) {
      throw {
        statusCode: (data && (data as any).statusCode) || result.status,
        message: (data && (data as any).message) || 'Error en un servicio interno',
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
