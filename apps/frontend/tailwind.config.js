/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './login.html',
    './kalender.html',
    './upcoming.html',
    './weekly-preview.html',
    './stundenplan.html',
    './tagesuebersicht.html',
    './notenrechner.html',
    './profile.html',
    './help.html',
    './changelog.html',
    './datenschutz.html',
    './impressum.html',
    './admin/dashboard.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        hm: {
          bg: '#0b0f1a',
          panel: '#111827',
          panelSoft: '#162033',
          border: 'rgba(148, 163, 184, 0.16)',
          text: '#f8fafc',
          muted: '#94a3b8',
          accent: '#4f6cff',
          cyan: '#38bdf8'
        }
      },
      boxShadow: {
        hm: '0 24px 60px rgba(2, 6, 23, 0.45)',
        'hm-soft': '0 18px 40px rgba(2, 6, 23, 0.28)'
      },
      borderRadius: {
        hm: '1.25rem'
      },
      backgroundImage: {
        'hm-shell':
          'radial-gradient(circle at top left, rgba(79, 108, 255, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 24%), linear-gradient(180deg, #08101d 0%, #0d1424 100%)'
      }
    }
  },
  plugins: []
};
