import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [react(), departuresRouteRedirectPlugin()],
  envDir: '.',
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        kalender: 'kalender.html',
        abfahrten: 'abfahrten/index.html',
        upcoming: 'upcoming.html',
        todos: 'todos.html',
        weeklyPreview: 'weekly-preview.html',
        stundenplan: 'stundenplan.html',
        tagesuebersicht: 'tagesuebersicht.html',
        notenrechner: 'notenrechner.html',
        profile: 'profile.html',
        help: 'help.html',
        changelog: 'changelog.html',
        datenschutz: 'datenschutz.html',
        impressum: 'impressum.html',
        adminDashboard: 'admin/dashboard.html'
      }
    }
  }
});
