# Sistema de Control de Viajes y Novedades — Backend

Backend en NestJS orientado a microservicios para la gestión de viajes en bus,
validación de pasajeros y reporte de novedades/gastos en ruta.

## Arquitectura

```
                    ┌─────────────┐
   Frontend  ─────▶ │   Gateway   │  (REST API pública, puerto 3000)
   (Ionic)          │  Auth + JWT │
                     │  RBAC       │
                     └──────┬──────┘
                            │ HTTP interno (x-internal-key)
              ┌─────────────┴─────────────┐
              ▼                           ▼
      ┌───────────────┐          ┌──────────────────┐
      │ trips-service │◀────────▶│operations-service │
      │  (puerto 3001)│   HTTP   │   (puerto 3002)    │
      │ Users/Trips/  │          │ Expenses/Incidents │
      │  Passengers   │          └──────────────────┘
      └───────┬───────┘                    │
              ▼                            ▼
        ┌──────────┐                ┌──────────────┐
        │ trips_db │                │operations_db │
        └──────────┘                └──────────────┘
              (mismo servidor PostgreSQL)
```

**Por qué esta arquitectura:**
- `trips-service` es dueño exclusivo de usuarios, viajes y pasajeros.
- `operations-service` es dueño exclusivo de gastos y novedades.
- Antes de aceptar un gasto o novedad, `operations-service` **consulta por HTTP**
  a `trips-service` si el viaje está `in_progress`. Si no lo está, rechaza la
  operación. Esto demuestra tanto la comunicación entre microservicios como la
  regla de negocio transaccional pedida en el reto.
- El `gateway` no tiene lógica de negocio propia: valida el JWT, aplica RBAC
  con Guards, reenvía la petición al microservicio correspondiente, y agrega
  datos de ambos servicios cuando se necesita un reporte combinado
  (`GET /trips/:id/report`).
- **Nota:** originalmente `gateway ⇄ trips-service ⇄ operations-service` se
  hablaban por TCP puro (`@nestjs/microservices`). Se migró a HTTP (rutas
  bajo `/internal`, protegidas con el header `x-internal-key`, ver
  `INTERNAL_API_KEY` en cada `.env.example`) porque el plan Free de Render
  —destino de despliegue de este proyecto— no permite tráfico de red privada
  entrante entre servicios, solo tráfico público HTTP(S). Ver `render.yaml`
  en la raíz del repo para el detalle del despliegue.

## Requisitos

- Docker y Docker Compose (única dependencia real para levantar todo)
- Node.js 20+ (solo si quieres correr algún servicio fuera de Docker)

## Cómo levantar el proyecto

1. Clona el repositorio y entra a la carpeta `backend/`.
2. (Opcional) copia los `.env.example` a `.env` en cada servicio si quieres
   cambiar algún valor. Los valores por defecto ya funcionan con Docker Compose
   tal cual están.
3. Ejecuta:

   ```bash
   docker-compose up --build
   ```

4. Espera a que los 4 contenedores estén arriba (postgres, trips-service,
   operations-service, gateway). El gateway queda disponible en:

   ```
   http://localhost:3000/api
   ```

5. Al arrancar por primera vez, `trips-service` crea automáticamente dos
   usuarios de prueba (ver credenciales abajo).

## Credenciales de prueba

| Rol       | Email                | Password       |
|-----------|-----------------------|----------------|
| Admin     | admin@viajes.com      | Admin123!      |
| Conductor | conductor@viajes.com  | Conductor123!  |

## Endpoints principales

Todos bajo el prefijo `/api`. Requieren header `Authorization: Bearer <token>`
excepto `/auth/login`.

### Auth
- `POST /auth/login` — `{ email, password }` → `{ accessToken, user }`

### Viajes (admin)
- `POST /trips` — crear viaje con pasajeros y conductor asignado
- `GET /trips?page=1&limit=10` — listado paginado
- `GET /users/drivers` — lista de conductores disponibles (para el selector al crear viaje)

### Viajes (conductor)
- `GET /trips/mine` — mis viajes asignados
- `GET /trips/:id` — detalle de un viaje
- `PATCH /trips/:id/passengers/:passengerId/checkin` — `{ boarded: true }`
- `POST /trips/:id/sign` — `{ signature: "data:image/png;base64,..." }`
  (obligatorio antes de poder iniciar el viaje)
- `POST /trips/:id/start` — falla si no hay firma registrada
- `POST /trips/:id/close` — cierra el viaje y devuelve el reporte resumen

### Gastos y novedades (conductor, viaje debe estar en curso)
- `POST /expenses` — `{ tripId, type, amount, concept }`
- `POST /incidents` — `{ tripId, type, description }`
- `GET /trips/:tripId/expenses`
- `GET /trips/:tripId/incidents`

### Reporte combinado (admin y conductor)
- `GET /trips/:id/report` — pasajeros, gastos totales y novedades del viaje

## Flujo de prueba sugerido (con Postman/Insomnia)

1. Login como admin → crear un viaje asignando el `driverId` del conductor
   de prueba (puedes obtenerlo haciendo login como conductor y mirando el
   `sub`/`userId` del JWT, o consultando `GET /trips/mine` tras crear el viaje).
2. Login como conductor → ver `GET /trips/mine`.
3. Marcar check-in de pasajeros.
4. Intentar `POST /trips/:id/start` **sin firmar** → debe devolver 400.
5. `POST /trips/:id/sign` con cualquier string base64 de prueba.
6. `POST /trips/:id/start` → ahora sí funciona.
7. Intentar registrar un gasto de un viaje que aún no inició → 400.
8. Con el viaje en curso, registrar gastos y novedades.
9. `POST /trips/:id/close` → devuelve el resumen final.

## Notas técnicas

- `synchronize: true` en TypeORM está activado solo por ser una prueba técnica
  con plazo corto; en producción se usarían migraciones.
- Los DTOs usan `class-validator` con `ValidationPipe({ whitelist: true, transform: true })`
  activo globalmente en el gateway.
- Manejo centralizado de errores vía `AllExceptionsFilter`, que traduce tanto
  excepciones HTTP normales como errores propagados desde los microservicios.
