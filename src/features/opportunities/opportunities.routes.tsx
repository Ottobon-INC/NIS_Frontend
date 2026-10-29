import type { RouteObject } from 'react-router-dom';
import { OpportunityWorkspace } from './pages/OpportunityWorkspace';
import { OpportunityDetailWorkspace } from './pages/OpportunityDetailWorkspace';
import { SolutionCapabilityMatchingWorkspace } from './pages/SolutionCapabilityMatchingWorkspace';
import { PostIntroductionWorkspace } from './pages/PostIntroductionWorkspace';
import { NetworkMatchingWorkspace } from '../network/pages/NetworkMatchingWorkspace';
import { FounderIntroductionWorkspace } from '../introductions/pages/FounderIntroductionWorkspace';
import { ProblemsBoardWorkspace } from './pages/ProblemsBoardWorkspace';

export const opportunityRoutes: RouteObject[] = [
  { path: '/opportunities', element: <OpportunityWorkspace /> },
  { path: '/opportunities/:id', element: <OpportunityDetailWorkspace /> },
  { path: '/opportunities/:id/matching', element: <SolutionCapabilityMatchingWorkspace /> },
  { path: '/opportunities/:id/network-matching', element: <NetworkMatchingWorkspace /> },
  { path: '/opportunities/:id/introduction', element: <FounderIntroductionWorkspace /> },
  { path: '/opportunities/:id/post-introduction', element: <PostIntroductionWorkspace /> },
  { path: '/problems', element: <ProblemsBoardWorkspace /> },
  { path: '/problems-board', element: <ProblemsBoardWorkspace /> },
];
