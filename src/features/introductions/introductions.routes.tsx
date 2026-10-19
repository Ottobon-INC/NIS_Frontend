import type { RouteObject } from 'react-router-dom';
import { MessageReview } from './pages/MessageReview';

export const introductionRoutes: RouteObject[] = [
  { path: '/messages/:id/review', element: <MessageReview /> },
];
