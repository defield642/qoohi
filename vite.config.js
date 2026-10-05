import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  cacheDir: '/tmp/qoohi-vite-cache',
  base: '/',
  plugins: [react(), {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin') {
          req.url = '/admin.html';
        } else if (req.url === '/institution' || req.url === '/institution/') {
          req.url = '/institution/index.html';
        }
        next();
      });
    },
  }],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        admin: new URL('./admin.html', import.meta.url).pathname,
        adminRoute: new URL('./admin/index.html', import.meta.url).pathname,
        institutionRoute: new URL('./institution/index.html', import.meta.url).pathname,
      },
    },
  },
})
