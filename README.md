# Sistema de Control de Viajes y Novedades

Plataforma para gestión de viajes en bus, validación de pasajeros y reporte
de novedades/gastos en ruta. Backend en NestJS orientado a microservicios,
frontend híbrido en Ionic + React.

## Estructura del repositorio

```
viajes-app/
├── backend/
│   ├── gateway/             API REST pública (Auth, RBAC, agregación)
│   ├── trips-service/       Microservicio: usuarios, viajes, pasajeros
│   ├── operations-service/  Microservicio: gastos, novedades
│   ├── docker-compose.yml
│   └── README.md            Instrucciones detalladas del backend
└── frontend/
    ├── src/
    │   ├── pages/admin/      Vistas del Administrador (escritorio)
    │   ├── pages/driver/     Vistas del Conductor (móvil)
    │   ├── theme/            Sistema de tokens (claro/oscuro/personalizado)
    │   └── contexts/         Estado global (Auth, Theme)
    └── Dockerfile
```

## Cómo levantar todo con Docker

Desde la carpeta `backend/`:

```bash
cd backend
docker-compose up --build
```

Esto levanta Postgres, `trips-service`, `operations-service` y el `gateway`
en `http://localhost:3000/api`.

Para el frontend (por ahora se corre aparte, no está en el docker-compose
del backend a propósito, para poder desplegarlo en Vercel/Netlify de forma
independiente):

```bash
cd frontend
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no está en localhost
npm run dev
```

Abre `http://localhost:5173`. Ingresa con:

| Rol       | Email                | Password       |
|-----------|-----------------------|----------------|
| Admin     | admin@viajes.com      | Admin123!      |
| Conductor | conductor@viajes.com  | Conductor123!  |

## Flujo de prueba end-to-end

1. Entra como **admin**, crea un viaje asignando al conductor de prueba y
   cargando 2-3 pasajeros.
2. Cierra sesión, entra como **conductor**, abre el viaje asignado.
3. Marca el check-in de los pasajeros.
4. Intenta iniciar el viaje sin firmar → el botón está bloqueado.
5. Dibuja la firma en el canvas y confírmala.
6. Ahora el botón "Iniciar viaje" se habilita.
7. Registra un gasto (combustible, peaje, reparación) y una novedad.
8. Cierra el viaje → te lleva al resumen con pasajeros transportados, total
   de gastos y novedades.
9. Entra de nuevo como admin y revisa el mismo viaje: verás el reporte
   agregado con toda la información.
10. Prueba el selector de tema (ícono de paleta en la barra superior):
    claro, oscuro, y personalizado (colores editables en vivo).

## Despliegue en vivo

- **Backend + BD:** Render. Usa el Blueprint `render.yaml` de la raíz del
  repo ("New +" → "Blueprint" en el dashboard de Render, apuntando a este
  repositorio): crea `gateway`, `trips-service`, `operations-service` (cada
  uno como Web Service Docker gratuito) y una base de datos PostgreSQL
  gratuita. Tras el primer deploy hay que completar a mano las URLs públicas
  de un servicio en las variables de entorno de los otros — el propio
  `render.yaml` trae las instrucciones paso a paso en sus comentarios.
- **Frontend:** Vercel, apuntando a la carpeta `frontend/`. Incluye
  `vercel.json` con el rewrite necesario para el ruteo de React Router.
  Configura `VITE_API_URL` en las variables de entorno del proyecto de
  Vercel con la URL pública del `gateway` desplegado en Render + `/api`.

**Nota sobre el plan Free de Render:** los servicios se "duermen" tras 15
min sin tráfico (la primera petición tras la inactividad puede tardar hasta
~50s en responder) y la base de datos Postgres gratuita se borra a los 30
días sin posibilidad de recuperación. Para un despliegue permanente, sube a
planes pagos (`plan: starter` en `render.yaml` y en la base de datos).

Ver `backend/README.md` para el detalle completo de variables de entorno,
endpoints y arquitectura de comunicación entre microservicios.
