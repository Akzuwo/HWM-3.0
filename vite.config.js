import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: 'frontend',
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
