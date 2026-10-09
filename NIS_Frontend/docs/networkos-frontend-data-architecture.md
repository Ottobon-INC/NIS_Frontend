# NetworkOS Frontend Data Architecture

## 1. Abstraction Layers
The UI must NOT depend directly on arbitrary backend JSON. NetworkOS employs a strict multi-layer translation model to insulate components from backend contract shifts, specifically guarding against deep graph queries vs flat payload discrepancies.

### API DTO
- **Location:** Backend / Interface definitions in `src/services/api/*.api.ts`.
- **Purpose:** The literal shape of the HTTP payload. Contains relational IDs and standard JSON arrays.

### Adapter
- **Location:** Translation functions inside `src/services/api/*.api.ts`.
- **Purpose:** Reconstructs the raw DTO into the Domain Model. For example, flattening nested graph nodes into a display array, or safely mapping missing `evidenceId` fields.

### View Model (Domain Model)
- **Location:** Returned explicitly by the Adapter to the TanStack Query hook.
- **Purpose:** The canonical shape the UI consumes. Guaranteed to possess `trustState` (`FACT`, `INFERENCE`, etc.) and `evidenceId` where applicable.

### Component Layer
- **Location:** `src/features/*`.
- **Purpose:** Solely responsible for rendering the View Model and dispatching intent-based mutations.

## 2. Global State vs Server State
- **Server State:** Handled exclusively by `TanStack Query`. (e.g., Intelligence data, Opportunity lists).
- **UI / Workflow State:** Handled by `zustand` (e.g., `useUIStore.ts` managing the `GlobalEvidenceDrawer` visibility, or contextual split-pane sizing).

## 3. Trust Data Enforcement
Every adapter handling intelligence data MUST structurally enforce the presence of:
`{ trustLevel: 'FACT' | 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED', evidenceId?: string }`
Failure to map this properly must fallback to an untrusted baseline to prevent hallucinating certainty.
