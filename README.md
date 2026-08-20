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

- **Backend + BD:** Render, Railway o Fly — cada carpeta de `backend/`
  (gateway, trips-service, operations-service) se despliega como un servicio
  Docker independiente, más una instancia de PostgreSQL gestionada.
- **Frontend:** Vercel o Netlify, apuntando a la carpeta `frontend/` con
  `VITE_API_URL` configurado hacia la URL pública del gateway desplegado.

Ver `backend/README.md` para el detalle completo de variables de entorno,
endpoints y arquitectura de comunicación entre microservicios.
