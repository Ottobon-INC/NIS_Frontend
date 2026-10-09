# Screen to API Contract Map

*Note: ALL backend contracts are currently marked as `BACKEND CONTRACT REQUIRED`. The UI will use `TEMPORARY FRONTEND MOCK CONTRACTS`.*

| Screen | Query/Mutation Hook | API Service | Temporary Mock Contract | Expected Backend Contract |
|:---|:---|:---|:---|:---|
| Dashboard | `useDashboard()` | `dashboard.get()` | `GET /mock/dashboard` | `GET /api/dashboard` |
| Add Contact | `useAddContact()` | `contacts.create()` | `POST /mock/contacts` | `POST /api/contacts` |
| Identify Person | `useIdentify()` | `contacts.getIdentify()` | `GET /mock/contacts/:id/identify` | `GET /api/contacts/:id/identify` |
| Contact 360 | `useContact360()` | `contacts.get360()` | `GET /mock/contacts/:id/360` | `GET /api/contacts/:id/360` |
| Intelligence | `useContactIntel()` | `contacts.getIntel()` | `GET /mock/contacts/:id/intel` | `GET /api/contacts/:id/intel` |
| Public Research | `useResearch()` | `research.get()` | `GET /mock/contacts/:id/research` | `GET /api/contacts/:id/research` |
| Dataset | `useDataset()` | `research.getDataset()` | `GET /mock/contacts/:id/dataset` | `GET /api/contacts/:id/dataset` |
| Relationship | `useRelationship()`| `contacts.getRel()` | `GET /mock/contacts/:id/relationship` | `GET /api/contacts/:id/relationship`|
| Roles | `useRoles()` | `contacts.getRoles()` | `GET /mock/contacts/:id/roles` | `GET /api/contacts/:id/roles` |
| Why Them/Us | `useWhy()` | `contacts.getWhy()` | `GET /mock/contacts/:id/why` | `GET /api/contacts/:id/value-match`|
| Evidence Drawer | `useEvidence()` | `evidence.get()` | `GET /mock/evidence/:id` | `GET /api/evidence/:id` |
| Research Task | `useResearchTasks()`| `tasks.getResearch()` | `GET /mock/tasks/research` | `GET /api/tasks/research` |
| Meeting Brief | `useMeetingBrief()`| `meetings.getBrief()` | `GET /mock/meetings/:id/brief` | `GET /api/meetings/:id/brief` |
| Meeting Capture | `useCapture()` | `meetings.upload()` | `POST /mock/meetings/:id/capture` | `POST /api/meetings/:id/capture` |
| Validate Need | `useNeeds()` | `opportunities.getNeeds()`| `GET /mock/opportunities/:id/needs` | `GET /api/opportunities/:id/needs` |
| Solution Match | `useSolutions()` | `opportunities.getSol()` | `GET /mock/opportunities/:id/solutions` | `GET /api/opportunities/:id/solutions`|
| Buyer Path | `usePath()` | `opportunities.update()`| `PATCH /mock/opportunities/:id/path` | `PATCH /api/opportunities/:id/path` |
| Opp Board | `useOppPipeline()` | `opportunities.getBoard()`| `GET /mock/opportunities/board` | `GET /api/opportunities/pipeline` |
| Outcome | `useOutcome()` | `outcomes.submit()` | `POST /mock/opportunities/:id/outcome` | `POST /api/opportunities/:id/outcome` |
| Messages | `useMessages()` | `tasks.getMessages()` | `GET /mock/tasks/messages` | `GET /api/messages/drafts` |
| Network Map | `useNetworkGraph()`| `network.getGraph()` | `GET /mock/network/graph` | `GET /api/network/graph` |
| Knowledge Base | `useKnowledge()` | `knowledge.get()` | `GET /mock/knowledge` | `GET /api/knowledge/services` |
