import type { RouteObject } from 'react-router-dom';
import { PeopleWorkspace } from './pages/PeopleWorkspace';
import { Contact360Workspace } from './pages/Contact360Workspace';
import { IntelligenceTranscriptWorkspace } from './pages/IntelligenceTranscriptWorkspace';
import { ContactList } from './pages/ContactList';
import { AddContact } from './pages/AddContact';
import { IdentifyPerson } from './pages/IdentifyPerson';
import { Contact360 } from './pages/Contact360';

export const contactRoutes: RouteObject[] = [
  { path: '/people', element: <PeopleWorkspace /> },
  { path: '/people/:id', element: <Contact360Workspace /> },
  { path: '/people/:id/transcript', element: <IntelligenceTranscriptWorkspace /> },
  { path: '/people/:id/*', element: <Contact360Workspace /> },
  // Legacy / contextual aliases
  { path: '/contacts', element: <ContactList /> },
  { path: '/contacts/new', element: <AddContact /> },
  { path: '/contacts/:id/identify', element: <IdentifyPerson /> },
  { path: '/contacts/:id/*', element: <Contact360 /> },
];
