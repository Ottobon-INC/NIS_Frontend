import type { RouteObject } from 'react-router-dom';
import { MeetingsWorkspace } from './pages/MeetingsWorkspace';
import { MeetingBriefWorkspace } from './pages/MeetingBriefWorkspace';
import { MeetingCaptureWorkspace } from './pages/MeetingCaptureWorkspace';
import { MeetingIntelligenceWorkspace } from './pages/MeetingIntelligenceWorkspace';
import { TrustedContextWorkspace } from './pages/TrustedContextWorkspace';

export const meetingRoutes: RouteObject[] = [
  { path: '/meetings', element: <MeetingsWorkspace /> },
  { path: '/meetings/:id/brief', element: <MeetingBriefWorkspace /> },
  { path: '/meetings/:id/capture', element: <MeetingCaptureWorkspace /> },
  { path: '/meetings/:id/intelligence', element: <MeetingIntelligenceWorkspace /> },
  { path: '/people/:id/context', element: <TrustedContextWorkspace /> },
];
