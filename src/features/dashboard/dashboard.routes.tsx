import type { RouteObject } from 'react-router-dom';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';

export const dashboardRoutes: RouteObject[] = [
  { path: '/dashboard', element: <ExecutiveDashboard /> },
];
