import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createSessionRevocationApp } from './session-revocation.js'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'session-revocation-api',
      configureServer(server) {
        // Vite uses Connect; mounting a small Express app supplies the response
        // helpers used by the same router in the production server.
        server.middlewares.use(createSessionRevocationApp())
      },
    },
  ],
  server: {
    port: 3300,
    host: true,
    allowedHosts: ['gsregistration.local'],
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // Hidden-iframe target for OIDC silent renew — must be a real build
        // entry (not a public/ file) so its module script resolves in prod.
        silentRenew: fileURLToPath(new URL('./silent-renew.html', import.meta.url)),
      },
    },
  },
})
