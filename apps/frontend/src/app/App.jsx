import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AboutPage } from '../pages/AboutPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ChangelogPage } from '../pages/ChangelogPage';
import { CurrentSubjectPage } from '../pages/CurrentSubjectPage';
import { DeparturesPage } from '../pages/DeparturesPage';
import { DayOverviewPage } from '../pages/DayOverviewPage';
import { GradeCalculatorPage } from '../pages/GradeCalculatorPage';
import { HelpPage } from '../pages/HelpPage';
import { HistoryPage } from '../pages/HistoryPage';
import { HomePage } from '../pages/HomePage';
import { LegalPage } from '../pages/LegalPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TodoListsPage } from '../pages/TodoListsPage';
import { TimetableWeekPage } from '../pages/TimetableWeekPage';
import { UpcomingPage } from '../pages/UpcomingPage';
import { WeeklyPreviewPage } from '../pages/WeeklyPreviewPage';

const ROUTES = [
  {
    title: 'Homework Manager',
    element: <HomePage />,
    paths: ['/', '/index.html'],
  },
  {
    title: 'Mehr ueber HWM - Homework Manager',
    element: <AboutPage />,
    paths: ['/mehr-ueber-hwm', '/about', '/about.html', '/mehr-ueber-hwm.html'],
  },
  {
    title: 'Geschichte von HWM - Homework Manager',
    element: <HistoryPage />,
    paths: ['/geschichte', '/geschichte.html'],
  },
  {
    title: 'User Guide - Homework Manager',
    element: <HelpPage />,
    paths: ['/help', '/help.html'],
  },
  {
    title: 'Changelog - Homework Manager',
    element: <ChangelogPage />,
    paths: ['/changelog', '/changelog.html'],
  },
  {
    title: 'Privacy Policy - Homework Manager',
    element: <LegalPage pageKey="privacy.main" />,
    paths: ['/datenschutz', '/datenschutz.html'],
  },
  {
    title: 'Legal Notice - Homework Manager',
    element: <LegalPage pageKey="imprint.main" />,
    paths: ['/impressum', '/impressum.html'],
  },
  {
    title: 'Login - Homework Manager',
    element: <LoginPage />,
    paths: ['/login', '/login.html'],
  },
  {
    title: 'Calendar - Homework Manager',
    element: <CalendarPage />,
    paths: ['/kalender', '/kalender.html'],
  },
  {
    title: 'Abfahrten - Homework Manager',
    element: <DeparturesPage />,
    paths: ['/abfahrten', '/abfahrten/'],
  },
  {
    title: 'Upcoming - Homework Manager',
    element: <UpcomingPage />,
    paths: ['/upcoming', '/upcoming.html'],
  },
  {
    title: 'ToDo Listen - Homework Manager',
    element: <TodoListsPage />,
    paths: ['/todos', '/todos.html'],
  },
  {
    title: 'Weekly Preview - Homework Manager',
    element: <WeeklyPreviewPage />,
    paths: ['/weekly-preview', '/weekly-preview.html'],
  },
  {
    title: 'Current Subject - Homework Manager',
    element: <CurrentSubjectPage />,
    paths: ['/stundenplan', '/stundenplan.html'],
  },
  {
    title: 'Daily Overview - Homework Manager',
    element: <DayOverviewPage />,
    paths: ['/tagesuebersicht', '/tagesuebersicht.html'],
  },
  {
    title: 'Wochenstundenplan - Homework Manager',
    element: <TimetableWeekPage />,
    paths: ['/timetable-week', '/timetable-week.html'],
  },
  {
    title: 'Grade Calculator - Homework Manager',
    element: <GradeCalculatorPage />,
    paths: ['/notenrechner', '/notenrechner.html'],
  },
  {
    title: 'Profile - Homework Manager',
    element: <ProfilePage />,
    paths: ['/profile', '/profile.html'],
  },
  {
    title: 'Admin Dashboard - Homework Manager',
    element: <AdminDashboardPage />,
    paths: ['/admin/dashboard', '/admin/dashboard.html'],
  },
];

function PageRoute({ title, element }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return element;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {ROUTES.flatMap((routeConfig) =>
            routeConfig.paths.map((path) => (
              <Route
                key={path}
                path={path}
                element={<PageRoute title={routeConfig.title} element={routeConfig.element} />}
              />
            ))
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
