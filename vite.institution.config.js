import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  cacheDir: "/tmp/qoohi-institution-vite-cache",
  base: "/",
  plugins: [react(), {
    name: "institution-root",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/" || req.url === "/index.html") req.url = "/institution.html";
        next();
      });
    },
  }],
  server: { host: "0.0.0.0", port: 5001, allowedHosts: true },
  build: { rollupOptions: { input: { institution: new URL("./institution.html", import.meta.url).pathname } } },
});
