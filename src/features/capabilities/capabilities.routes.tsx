import type { RouteObject } from 'react-router-dom';
import { CapabilityWorkspace } from './pages/CapabilityWorkspace';

const CapabilityIntelligence = () => <div><h2>Capability Intelligence</h2><p>Products and Services knowledge base goes here.</p></div>;

export const capabilityRoutes: RouteObject[] = [
  { path: '/capabilities', element: <CapabilityWorkspace /> },
  { path: '/knowledge', element: <CapabilityIntelligence /> },
];
