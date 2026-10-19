import type { RouteObject } from 'react-router-dom';
import { NetworkMap } from './pages/NetworkMap';
import { NetworkMatch } from './pages/NetworkMatch';
import { CrossClientIntel } from './pages/CrossClientIntel';
import { EcosystemEvents } from './pages/EcosystemEvents';

export const networkRoutes: RouteObject[] = [
  { path: '/network', element: <NetworkMap /> },
  { path: '/network/map', element: <NetworkMap /> },
  { path: '/network/matches/:id', element: <NetworkMatch /> },
  { path: '/network/cross-client', element: <CrossClientIntel /> },
  { path: '/network/events', element: <EcosystemEvents /> },
];
