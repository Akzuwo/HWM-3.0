import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

function departuresRouteRedirectPlugin() {
  return {
    name: 'departures-route-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/abfahrten') {
          res.statusCode = 302;
          res.setHeader('Location', '/abfahrten/');
          res.end();
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), departuresRouteRedirectPlugin(), cloudflare()],
  envDir: '.',
  server: {
    host: true,
    port: 5173
  }
});