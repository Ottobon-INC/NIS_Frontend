# Backend Contract Checklist

This document details all API endpoints and backend dependencies currently assumed by the NetworkOS frontend.

## 1. Authentication & Base Setup
- **Base URL:** `VITE_API_BASE_URL` (Default: `http://localhost:8080`)
- **Authentication:** Frontend expects standard HTTP-only cookies or bearer tokens injected via an Axios interceptor (to be implemented during integration). Currently assumed to pass silently in mock mode.

## 2. Dashboard
- **`GET /api/dashboard`**
  - **Response:** `{ stats: { actionRequired: number, researched: number } }`
  - **Async:** Standard sync response.

## 3. Contacts
- **`POST /api/contacts`**
  - **Request:** `{ url: string }`
  - **Response:** `{ id: string, status: 'PROCESSING' | 'SUCCESS' }`
  - **Async:** Polling required if PROCESSING.
- **`GET /api/contacts/:id`**
  - **Response:** Full contact 360 DTO.
- **`GET /api/contacts/:id/identify`**
  - **Response:** Identification snippet.
- **`PATCH /api/contacts/:id/identify`**
  - **Request:** `{ status: 'CONFIRMED' | 'REJECTED' }`
- **`GET /api/contacts/:id/research`**
  - **Response:** Array of `ResearchItem` DTOs with `evidenceId` and `trustLevel`.

## 4. Meetings
- **`GET /api/meetings/:id/brief`**
  - **Response:** `{ id, contactId, contactName, goals: [], hypotheses: [] }`
- **`POST /api/meetings/:id/capture`**
  - **Request:** `{ fileId | content }`
  - **Response:** `{ success: boolean, jobId: string }`
  - **Async:** Requires polling `GET /api/jobs/:id`.

## 5. Opportunities & Match Engine
- **`GET /api/opportunities/:id/needs`**
  - **Response:** `{ opportunityId, meetingId, items: ExtractedIntelligence[] }`
- **`PATCH /api/opportunities/:id/needs/:itemId`**
  - **Request:** `{ status: 'CONFIRMED' | 'REJECTED' }`
  - **Behavior:** Explicit founder approval gate.
- **`GET /api/opportunities/:id/solutions`**
  - **Response:** Array of `SolutionCandidate`.
- **`PATCH /api/opportunities/:id/path`**
  - **Request:** `{ path: string }`
- **`GET /api/opportunities/pipeline`**
  - **Response:** `pipeline` array containing items matching `workflow-states.md` statuses (`VALIDATED`, `SOLUTION_MATCHING`, `PATH_DEFINED`, `PIPELINE`, `OUTCOME`).
- **`POST /api/opportunities/:id/outcome`**
  - **Request:** `{ outcome: string, notes: string }`

## 6. Network Match & Feedback
- **`GET /api/network/matches/:id`**
  - **Response:** `NetworkMatchDetail` DTO with discrete scores (matchScore, relationshipStrength, etc.) and `reasons` array containing `evidenceId`.
- **`POST /api/network/matches/:id/approval`**
  - **Request:** `{ action: 'APPROVE' | 'REJECT' }`
  - **Behavior:** Rejection does NOT delete, merely updates state.

## 7. Introductions
- **`GET /api/messages/drafts/:id`**
  - **Response:** `IntroDraft` DTO with `status: 'DRAFT' | 'APPROVED_TO_SEND'`.
- **`POST /api/messages/approve/:id`**
  - **Request:** `{ body: string }`
  - **Response:** `{ success: boolean, status: 'APPROVED_TO_SEND' }`
  - **Behavior:** Frontend does NOT actually send the message. Backend cron/worker expected to pick up `APPROVED_TO_SEND` state.

## 8. Network Intel
- **`GET /api/network/graph`**
  - **Response:** `{ nodes: [], edges: [] }`
  - **Behavior:** Bounded graph logic must be handled on the backend (pagination/filtering).
- **`GET /api/network/events`**
  - **Response:** Array of `EcosystemEvent`.
- **`GET /api/network/insights`**
  - **Response:** Array of `CrossClientInsight`.

## Key Architectural Expectations
1. **DTO Mapping:** Nested graphs must be serialized efficiently (e.g. Pipeline endpoints should return flat display data).
2. **Evidence Links:** The backend MUST supply `evidenceId` strings on any AI Inference object.
3. **Trust States:** DTOs must distinguish `FACT`, `SIGNAL`, `INFERENCE`, `HYPOTHESIS`.
