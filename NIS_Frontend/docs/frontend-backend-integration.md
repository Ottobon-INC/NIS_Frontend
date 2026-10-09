# Frontend to Backend Integration Guide

This document is for the Backend Engineering team. The NetworkOS frontend is completely built, QA'd, and hardened in `mock` mode. It is currently operating using MSW (Mock Service Worker).

The objective of integration is to switch `VITE_API_MODE` to `real` and wire up the deployed REST endpoints.

## 1. Environment Configuration

The frontend controls API execution behavior via `.env`.

**Development (Current):**
```env
VITE_API_MODE=mock
VITE_API_BASE_URL=http://localhost:8080
```
When `VITE_API_MODE=mock`, `src/mocks/browser.ts` initializes MSW to intercept all `fetch` requests matching the base URL.

**Production / Integration:**
```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.networkos.internal (Or actual staging URL)
```
When switched to `real`, MSW is bypassed, and the `apiClient` routes directly to the backend.

## 2. Adapter Architecture

All API calls are centralized in domain-specific files under `src/services/api/`. 
**Do NOT make `fetch` or `axios` calls directly from React components.**

If the backend response DTOs differ slightly from the frontend's expected TypeScript interfaces, **create an Adapter function inside the respective `*.api.ts` file**. The component layer relies entirely on the output of TanStack Query wrapping these API functions.

Example mapping a complex backend graph response to a flat pipeline DTO:
```typescript
// Inside opportunities.api.ts
getPipeline: async () => {
  const response = await apiClient.get<BackendPipelineDTO>('/api/opportunities/pipeline');
  return { pipeline: mapBackendPipelineToFrontendViewModel(response) };
}
```

## 3. Trust UX Constraints

The UI actively parses and visually separates data based on trust labels:
`FACT` | `SIGNAL` | `INFERENCE` | `HYPOTHESIS` | `CONFIRMED`

The backend MUST include the correct trust enum string on all intelligence objects. If it is an `INFERENCE` or `HYPOTHESIS`, the backend MUST optionally attach an `evidenceId`. The frontend `GlobalEvidenceDrawer` will automatically hook into that ID to pull the underlying source document.

## 4. Asynchronous Processing & State Machines

Certain actions require background AI processing. The frontend currently mocks this via delays and HTTP polling endpoints.

**Example: Meeting Extraction**
1. Frontend POSTs `/api/meetings/:id/capture`.
2. Backend returns `{ jobId: string }`.
3. Frontend polls `GET /api/jobs/:id` until `status === 'COMPLETE'`.
4. Frontend invalidates cache and transitions UI to `VALIDATION_REQUIRED`.

The backend must support this async job polling structure for heavy extraction/scraping tasks.

## 5. Absolute Founder Control

The frontend assumes that the backend API **does not autonomously execute actions upon simple data generation**. 
For example, generating an Introduction Draft does not send it. The frontend explicitly calls `POST /api/messages/approve/:id`. The backend is responsible for setting the `APPROVED_TO_SEND` state, at which point an external cron/worker can dispatch the email.

## 6. Authentication Integration

A placeholder is ready. 
Upon integration, update `src/services/api/core/client.ts` to attach the necessary `Authorization: Bearer <token>` headers or configure it to `include: 'credentials'` for session cookies.

## Next Step

1. Deploy the real backend API.
2. Provide the base URL to the frontend via `.env`.
3. Set `VITE_API_MODE=real`.
4. Perform end-to-end integration testing.
