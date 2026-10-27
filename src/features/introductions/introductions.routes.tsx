import type { RouteObject } from 'react-router-dom';
import { IntroductionsWorkspace } from './pages/IntroductionsWorkspace';
import { MessageReview } from './pages/MessageReview';

export const introductionRoutes: RouteObject[] = [
  { path: '/introductions', element: <IntroductionsWorkspace /> },
  { path: '/messages/:id/review', element: <MessageReview /> },
];
