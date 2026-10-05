import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  cacheDir: "/tmp/qoohi-institution-vite-cache",
  base: "/institution/",
  plugins: [react(), {
    name: "institution-root",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname, query] = (req.url || "").split("?", 2);
        if (pathname === "/" || pathname === "/index.html") {
          req.url = `/institution.html${query ? `?${query}` : ""}`;
        }
        next();
      });
    },
  }],
  server: { host: "0.0.0.0", port: 5001, allowedHosts: true },
  build: {
    emptyOutDir: false,
    rollupOptions: { input: { institution: new URL("./institution.html", import.meta.url).pathname } },
  },
});
