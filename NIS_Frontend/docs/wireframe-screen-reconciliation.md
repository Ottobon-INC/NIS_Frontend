# Wireframe Screen Reconciliation

| Screen ID | Screen Name | Route | Workflow Stage | Purpose | Entry Point | Previous Screen | Primary CTA | Next Screen | Back Navigation | API Dependency | State Representation |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 01 | Executive Dashboard | `/` | Overview | Executive summary of intelligence & pipeline | App load | None | Navigate to Task | Dynamic | N/A | `GET /api/dashboard` | Loading, Success, Error |
| 02 | Add Contact | `/contacts/new` | Intake | Intake of LinkedIn URL | Dashboard/Nav | Dashboard | Submit | `/contacts/:id/identify` | Dashboard | `POST /api/contacts` | Input, Processing (Async), Success |
| 03 | Identify Person | `/contacts/:id/identify` | Intake/Enrich | Confirm scraped data | `/contacts/new` | Add Contact | Confirm | `/contacts/:id` (Contact 360) | Add Contact | `GET /api/contacts/:id`, `PATCH` | Loading, Review, Error |
| 04 | Relationship Context | `/contacts/:id/relationship` | Contact 360 (Tab) | Map past interactions | Contact 360 | Contact 360 Overview | Connect CRM | N/A | Contact 360 | `GET /api/contacts/:id/relationship` | Empty, Success |
| 05 | Contact 360 | `/contacts/:id` | Contact 360 | Central Hub | Identify Person | Identify Person | Prepare Meeting | `/meetings/:id/brief` | Dashboard | `GET /api/contacts/:id/360` | Loading, Success, Error |
| 06 | Research Priority | `/tasks/research` | Signal Engine | Queue of needed research | Nav | Dashboard | Trigger Research | `/contacts/:id/research`| Dashboard | `GET /api/tasks/research` | Loading, Empty, Success |
| 07 | Public Research | `/contacts/:id/research` | Contact 360 (Tab) | Public signals view | Contact 360 | Contact 360 Overview | View Evidence | Evidence Drawer | Contact 360 | `GET /api/contacts/:id/research` | Processing, Success, Error |
| 08 | Research Dataset | `/contacts/:id/dataset` | Contact 360 (Tab) | Raw data layer | Public Research | Public Research | N/A | N/A | Public Research | `GET /api/contacts/:id/dataset` | Loading, Success |
| 09 | Evidence Layer | Global Drawer | Evidence | Explain AI source | Any Inference | Any | Close Drawer | N/A | Close | `GET /api/evidence/:id` | Loading, Success, Empty |
| 10 | Person & Company Intel | `/contacts/:id/intelligence` | Contact 360 (Tab) | Deep dive profile | Contact 360 | Contact 360 Overview | N/A | N/A | Contact 360 | `GET /api/contacts/:id/intelligence` | Loading, Success, Error |
| 11 | Potential Roles | `/contacts/:id/roles` | Contact 360 (Tab) | View predicted roles | Contact 360 | Contact 360 Overview | Confirm Role | N/A | Contact 360 | `GET /api/contacts/:id/roles` | Loading, Success |
| 12 | Why Them / Why Us | `/contacts/:id/why` | Contact 360 (Tab) | Bi-directional value | Contact 360 | Contact 360 Overview | N/A | N/A | Contact 360 | `GET /api/contacts/:id/value-match` | Loading, Empty, Success |
| 13 | Products & Services KB | `/knowledge` | Knowledge Base | Manage internal capability | Nav | Dashboard | Add Service | `/knowledge/new` | Dashboard | `GET /api/knowledge/services` | Loading, Success |
| 14 | Hypothesis Analysis | `/opportunities/hypothesis` | Opp Engine | Gap analysis review | Contact 360 | Contact 360 | Validate | `/opportunities/:id/validate` | Contact 360 | `GET /api/opportunities/hypothesis` | Loading, Empty, Success |
| 15 | Conversation Brief | `/meetings/:id/brief` | Meeting Prep | Pre-meeting doc | Contact 360 | Contact 360 | Capture Meeting | `/meetings/:id/capture` | Contact 360 | `GET /api/meetings/:id/brief` | Loading, Success |
| 16 | Message Human Review | `/tasks/messages` | Introduction | Review AI drafted intro | Nav / Match | Network Match | Approve | `/opportunities/:id/outcome` | Match Review | `GET /api/messages/drafts` | Loading, Success, Processing |
| 17 | Conversation Capture | `/meetings/:id/capture` | Meeting Intel | Upload transcript | Meeting Brief | Meeting Brief | Upload | `/opportunities/:id/validate` | Meeting Brief | `POST /api/meetings/:id/capture` | Input, Processing, Success |
| 18 | Validate Need | `/opportunities/:id/validate` | Founder Validation| Confirm AI problem | Meeting Capture | Meeting Capture | Confirm Needs | `/opportunities/:id/solutions` | Meeting Capture | `GET /api/opportunities/:id/needs` | Loading, Success, Error |
| 19 | Solution Matching | `/opportunities/:id/solutions` | Opp Engine | Map to KB | Validate Need | Validate Need | Match Solutions | `/opportunities/:id/path` | Validate Need | `GET /api/opportunities/:id/solutions` | Loading, Empty, Success |
| 20 | Buyer/Partner Path | `/opportunities/:id/path` | Opp Engine | Set opp type | Solution Match | Solution Matching | Set Path | `/opportunities/board` | Solution Match | `PATCH /api/opportunities/:id/path` | Loading, Success |
| 21 | Opportunity Board | `/opportunities/board` | Pipeline | Kanban view | Nav | App Shell | View Detail | `/opportunities/:id` | Dashboard | `GET /api/opportunities/pipeline` | Loading, Empty, Success |
| 22 | Outcome Tracking | `/opportunities/:id/outcome` | Feedback Loop | Log result | Nav / Intro | Introduction | Submit Feedback | Dashboard | Intro Review | `POST /api/opportunities/:id/outcome` | Input, Success |
| 23 | Ecosystem Event | `/network/events` | Network Match | Event triggers | Nav | App Shell | View Contact | `/contacts/:id` | Network | `GET /api/network/events` | Loading, Empty, Success |
| 24 | Network Map | `/network/map` | Network Match | Graph visualization | Nav | App Shell | View Match | `/network/matches/:id` | Dashboard | `GET /api/network/graph` | Loading, Success |
| 25 | Cross-Client Intel | `/network/cross-client` | Hybrid Match | Aggregated insights | Nav | App Shell | View Opportunity | `/opportunities/:id` | Dashboard | `GET /api/network/insights` | Loading, Empty, Success |
| 26 | Navigation Global UI | App Shell | All | Global context layout | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
