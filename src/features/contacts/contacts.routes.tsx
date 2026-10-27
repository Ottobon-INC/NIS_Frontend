import { Navigate, useParams } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { PeopleWorkspace } from './pages/PeopleWorkspace';
import { Contact360Workspace } from './pages/Contact360Workspace';
import { IntelligenceTranscriptWorkspace } from './pages/IntelligenceTranscriptWorkspace';
import { AddContact } from './pages/AddContact';
import { IdentifyPerson } from './pages/IdentifyPerson';

const ContactRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/people/${id}` : '/people'} replace />;
};

export const contactRoutes: RouteObject[] = [
  { path: '/people', element: <PeopleWorkspace /> },
  { path: '/people/:id', element: <Contact360Workspace /> },
  { path: '/people/:id/transcript', element: <IntelligenceTranscriptWorkspace /> },
  { path: '/people/:id/*', element: <Contact360Workspace /> },
  // Legacy / contextual aliases
  { path: '/contacts', element: <Navigate to="/people" replace /> },
  { path: '/contacts/new', element: <AddContact /> },
  { path: '/contacts/:id/identify', element: <IdentifyPerson /> },
  { path: '/contacts/:id/*', element: <ContactRedirect /> },
];

