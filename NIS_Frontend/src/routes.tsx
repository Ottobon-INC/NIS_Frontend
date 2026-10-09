


import { PeopleWorkspace } from './features/contacts/pages/PeopleWorkspace';
import { Contact360Workspace } from './features/contacts/pages/Contact360Workspace';
import { IntelligenceTranscriptWorkspace } from './features/contacts/pages/IntelligenceTranscriptWorkspace';
import { ContactList } from './features/contacts/pages/ContactList';
import { AddContact } from './features/contacts/pages/AddContact';
import { IdentifyPerson } from './features/contacts/pages/IdentifyPerson';
import { Contact360 } from './features/contacts/pages/Contact360';
import { MeetingBriefWorkspace } from './features/meetings/pages/MeetingBriefWorkspace';
import { MeetingCaptureWorkspace } from './features/meetings/pages/MeetingCaptureWorkspace';
import { MeetingIntelligenceWorkspace } from './features/meetings/pages/MeetingIntelligenceWorkspace';
import { TrustedContextWorkspace } from './features/meetings/pages/TrustedContextWorkspace';

import { OpportunityWorkspace } from './features/opportunities/pages/OpportunityWorkspace';
import { OpportunityDetailWorkspace } from './features/opportunities/pages/OpportunityDetailWorkspace';
import { SolutionCapabilityMatchingWorkspace } from './features/opportunities/pages/SolutionCapabilityMatchingWorkspace';
import { NetworkMatchingWorkspace } from './features/network/pages/NetworkMatchingWorkspace';
import { FounderIntroductionWorkspace } from './features/introductions/pages/FounderIntroductionWorkspace';
import { PostIntroductionWorkspace } from './features/opportunities/pages/PostIntroductionWorkspace';
import { CapabilityWorkspace } from './features/capabilities/pages/CapabilityWorkspace';
import { NetworkMatch } from './features/network/pages/NetworkMatch';
import { NetworkMap } from './features/network/pages/NetworkMap';
import { CrossClientIntel } from './features/network/pages/CrossClientIntel';
import { EcosystemEvents } from './features/network/pages/EcosystemEvents';
import { MessageReview } from './features/introductions/pages/MessageReview';

// Legacy Dashboard removed, replaced by FounderCockpit

const Tasks = () => <div><h2>Tasks</h2><p>Deprecated. Tasks are now in Founder Decision Queue.</p></div>;
const CapabilityIntelligence = () => <div><h2>Capability Intelligence</h2><p>Products and Services knowledge base goes here.</p></div>;
const NotFound = () => <div><h2>404 - Not Found</h2><p>The requested workflow step does not exist.</p></div>;

import { Navigate } from 'react-router-dom';

export const routes = [
  // Global Workspaces
  { path: '/', element: <Navigate to="/people" replace /> },
  { path: '/people', element: <PeopleWorkspace /> },
  { path: '/people/:id', element: <Contact360Workspace /> },
  { path: '/people/:id/transcript', element: <IntelligenceTranscriptWorkspace /> },
  { path: '/people/:id/*', element: <Contact360Workspace /> },
  { path: '/opportunities', element: <OpportunityWorkspace /> },
  { path: '/opportunities/:id', element: <OpportunityDetailWorkspace /> },
  { path: '/opportunities/:id/matching', element: <SolutionCapabilityMatchingWorkspace /> },
  { path: '/opportunities/:id/network-matching', element: <NetworkMatchingWorkspace /> },
  { path: '/opportunities/:id/introduction', element: <FounderIntroductionWorkspace /> },
  { path: '/opportunities/:id/post-introduction', element: <PostIntroductionWorkspace /> },
  { path: '/capabilities', element: <CapabilityWorkspace /> },
  { path: '/network', element: <NetworkMap /> },

  // Legacy/Contextual Routes (Preserved for safe migration)
  { path: '/contacts', element: <ContactList /> },
  { path: '/contacts/new', element: <AddContact /> },
  { path: '/contacts/:id/identify', element: <IdentifyPerson /> },
  { path: '/contacts/:id/*', element: <Contact360 /> },
  { path: '/people/:id/*', element: <Contact360 /> },
  
  { path: '/meetings/:id/brief', element: <MeetingBriefWorkspace /> },
  { path: '/meetings/:id/capture', element: <MeetingCaptureWorkspace /> },
  { path: '/meetings/:id/intelligence', element: <MeetingIntelligenceWorkspace /> },
  { path: '/people/:id/context', element: <TrustedContextWorkspace /> },
  
  { path: '/network/matches/:id', element: <NetworkMatch /> },
  { path: '/network/map', element: <NetworkMap /> },
  { path: '/network/cross-client', element: <CrossClientIntel /> },
  { path: '/network/events', element: <EcosystemEvents /> },
  
  { path: '/messages/:id/review', element: <MessageReview /> },
  { path: '/tasks', element: <Tasks /> },
  { path: '/knowledge', element: <CapabilityIntelligence /> },
  
  { path: '*', element: <NotFound /> }
];
