import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ChangelogPage } from '../pages/ChangelogPage';
import { CurrentSubjectPage } from '../pages/CurrentSubjectPage';
import { DeparturesPage } from '../pages/DeparturesPage';
import { DayOverviewPage } from '../pages/DayOverviewPage';
import { GradeCalculatorPage } from '../pages/GradeCalculatorPage';
import { HelpPage } from '../pages/HelpPage';
import { HomePage } from '../pages/HomePage';
import { LegalPage } from '../pages/LegalPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TodoListsPage } from '../pages/TodoListsPage';
import { TimetableWeekPage } from '../pages/TimetableWeekPage';
import { UpcomingPage } from '../pages/UpcomingPage';
import { WeeklyPreviewPage } from '../pages/WeeklyPreviewPage';

const PAGE_MAP = {
  home: {
    title: 'Homework Manager',
    component: HomePage
  },
  login: {
    title: 'Login - Homework Manager',
    component: LoginPage
  },
  calendar: {
    title: 'Calendar - Homework Manager',
    component: CalendarPage
  },
  upcoming: {
    title: 'Upcoming - Homework Manager',
    component: UpcomingPage
  },
  todos: {
    title: 'ToDo Listen - Homework Manager',
    component: TodoListsPage
  },
  'weekly-preview': {
    title: 'Weekly Preview - Homework Manager',
    component: WeeklyPreviewPage
  },
  'current-subject': {
    title: 'Current Subject - Homework Manager',
    component: CurrentSubjectPage
  },
  departures: {
    title: 'Abfahrten - Homework Manager',
    component: DeparturesPage
  },
  'day-overview': {
    title: 'Daily Overview - Homework Manager',
    component: DayOverviewPage
  },
  'timetable-week': {
    title: 'Wochenstundenplan - Homework Manager',
    component: TimetableWeekPage
  },
  'grade-calculator': {
    title: 'Grade Calculator - Homework Manager',
    component: GradeCalculatorPage
  },
  profile: {
    title: 'Profile - Homework Manager',
    component: ProfilePage
  },
  help: {
    title: 'User Guide - Homework Manager',
    component: HelpPage
  },
  changelog: {
    title: 'Changelog - Homework Manager',
    component: ChangelogPage
  },
  privacy: {
    title: 'Privacy Policy - Homework Manager',
    component: () => <LegalPage pageKey="privacy.main" />
  },
  imprint: {
    title: 'Legal Notice - Homework Manager',
    component: () => <LegalPage pageKey="imprint.main" />
  },
  'admin-dashboard': {
    title: 'Admin Dashboard - Homework Manager',
    component: AdminDashboardPage
  }
};

function resolvePageName() {
  const root = document.getElementById('root');
  return root?.dataset.page || 'home';
}

export function App() {
  const pageName = resolvePageName();
  const pageConfig = PAGE_MAP[pageName] || PAGE_MAP.home;
  const PageComponent = pageConfig.component;

  if (pageConfig.title) {
    document.title = pageConfig.title;
  }

  return <PageComponent />;
}
