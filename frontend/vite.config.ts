import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  // basicSsl genera un certificado autofirmado para poder probar HTTPS en
  // desarrollo. Es necesario porque los navegadores móviles bloquean el
  // acceso a la cámara (para el escáner de QR) en páginas servidas por HTTP
  // simple, salvo en "localhost" — y desde el celular no entras por
  // localhost, sino por la IP de tu PC en la red WiFi.
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    host: true,
    https: true,
    // El gateway del backend sigue corriendo en HTTP normal (no necesita
    // HTTPS). Este proxy hace que, sin importar desde qué dispositivo o IP
    // entres al frontend, las peticiones a /api se reenvíen internamente
    // (desde esta misma PC) hacia el backend en localhost:3000. Así se evita
    // el bloqueo del navegador por "contenido mixto" (https llamando a http).
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
