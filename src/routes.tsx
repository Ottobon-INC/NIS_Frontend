import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { contactRoutes } from './features/contacts/contacts.routes';
import { opportunityRoutes } from './features/opportunities/opportunities.routes';
import { meetingRoutes } from './features/meetings/meetings.routes';
import { networkRoutes } from './features/network/network.routes';
import { introductionRoutes } from './features/introductions/introductions.routes';
import { capabilityRoutes } from './features/capabilities/capabilities.routes';

const Tasks = () => <div><h2>Tasks</h2><p>Deprecated. Tasks are now in Founder Decision Queue.</p></div>;
const NotFound = () => <div><h2>404 - Not Found</h2><p>The requested workflow step does not exist.</p></div>;

/**
 * Root modular routing configuration.
 * Individual feature teams (Dashboard, Contacts, Opportunities, Network) manage their routes inside
 * their respective feature directories (e.g. features/opportunities/opportunities.routes.tsx).
 * Do not add individual page routes directly here!
 */
export const routes: RouteObject[] = [
  // Default entrypoint redirect (Dashboard)
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // Stream 0: Dashboard & Founder Cockpit
  ...dashboardRoutes,

  // Stream 1: Contacts & Identity
  ...contactRoutes,

  // Stream 2: Opportunities & Context
  ...opportunityRoutes,
  ...meetingRoutes,
  ...capabilityRoutes,

  // Stream 3: Network & Introductions
  ...networkRoutes,
  ...introductionRoutes,

  // Global fallbacks
  { path: '/tasks', element: <Tasks /> },
  { path: '*', element: <NotFound /> }
];
