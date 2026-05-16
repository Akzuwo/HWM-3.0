import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function AdminDashboardPage() {
  usePageSetup({
    bodyClass: '',
    scripts: ['adminDashboard']
  });

  return (
    <AppLayout>
      <main className="admin-dashboard" id="admin-dashboard-root">
        <noscript data-i18n="admin.noscript">Please enable JavaScript to manage the admin dashboard.</noscript>
      </main>
    </AppLayout>
  );
}

