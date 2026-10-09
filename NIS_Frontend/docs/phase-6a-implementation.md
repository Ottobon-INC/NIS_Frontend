# Phase 6A Implementation Report

## 1. Files Changed
- `src/routes.tsx`: Re-architected routing to map the new global workspaces while keeping old routes active for safe migration.
- `src/components/layout/Sidebar.tsx`: Replaced page-based navigation with Global Workspace navigation.

## 2. Files Created
- `src/components/layout/WorkspaceShell.tsx`: Standardized structural container supporting breadcrumbs, primary/secondary actions, and normalized loading/error/empty states.
- `src/components/intelligence/FounderDecisionQueue.tsx`: Reusable unified component for all founder action items.
- `src/features/dashboard/pages/FounderCockpit.tsx`: Replaces the legacy dashboard with an action-centric workspace.

## 3. Routing Changes
The sidebar and top-level routing now strictly enforce the Global Workspaces:
- `/` -> Founder Intelligence Cockpit
- `/people` -> People / Relationships Workspace (currently mapping to existing `ContactList`)
- `/opportunities` -> Opportunity Workspace (currently mapping to existing `OpportunityBoard`)
- `/network` -> Network Intelligence Workspace (currently mapping to existing `NetworkMap`)
- `/capabilities` -> Capability Intelligence Workspace (stubbed)

Legacy routes (e.g., `/contacts`, `/contacts/new`, `/meetings/:id/brief`) are preserved intact in `routes.tsx` to prevent breaking existing components before their respective rebuild phases. The standalone `/tasks` route has been formally deprecated.

## 4. Workspace Changes
Introduced `WorkspaceShell` as the standard UI architecture. This enforces:
- Contextual headers rather than arbitrary text.
- Unified placement for primary/secondary decisions.
- Standardized handling of async logic (`isLoading`, `isError`, `isEmpty`).

## 5. Founder Cockpit Architecture
The `FounderCockpit` explicitly answers "WHAT NEEDS MY ATTENTION?"
- **Founder Attention (Queue):** Displays explicitly actionable items requiring human validation or approval.
- **Important Signals:** Isolates high-priority external events (integrating directly with the `GlobalEvidenceDrawer`).
- **Active Opportunities:** Provides quick-view contextual hops into deep pipeline logic.

## 6. Decision Queue Architecture
The `FounderDecisionQueue` standardizes how the AI requests founder action.
It strictly enforces the design hierarchy:
- **CONTEXT:** Who/What this is about.
- **WHY:** Explanation of the AI's logic.
- **EVIDENCE:** Transparency into provenance.
- **DECISION:** Explicit CTA.

## 7. API Changes
None. The existing TanStack Query and Axios integrations were deliberately untouched.

## 8. Mock Changes
The mock data has been cleanly abstracted into MSW at `GET /api/founder/decisions`. The existing NetworkOS story logic (Sarah Connor / Alan Turing) is preserved there, decoupling the UI from hardcoded mock objects.

## 9. Founder Decision Queue API Boundary
The Founder Decision Queue has been correctly decoupled from UI components.
- **API Service:** `src/services/api/founder.api.ts` handles the HTTP interaction (`getDecisions()`).
- **Query Hook:** `useFounderDecisions()` encapsulates the TanStack Query caching and async state.
- **DTO:** `DecisionItem` specifies the rigid shape for tasks (`id`, `type`, `evidenceSummary`, `confidence`).
- **Adapter:** Currently maps the MSW JSON directly to `DecisionItem`. A future explicit adapter could be added if the backend payload diverges from the UI view model.
- **MSW Endpoint:** `GET /api/founder/decisions` returns the established Sarah Connor / Alan Turing mock story.
- **Future Real Backend Replacement:** When connected to the real backend, the `founderApi.getDecisions` function will naturally query the real server without any UI refactoring required, controlled by the `VITE_API_MODE` toggle.

## 10. Reusable Components Created
- `WorkspaceShell`
- `FounderDecisionQueue`

## 11. Components Preserved
- `AppShell` and `TopNavigation`
- All Phase 1-5 domain components (`Contact360`, `MeetingBrief`, `ValidateNeed`, `SolutionMatching`, etc.).
- `TrustBadge` and `GlobalEvidenceDrawer` (Integrated actively into the Cockpit).
- All API and Adapter layers.

## 12. Components Deprecated but not Deleted
- The legacy `Tasks` component.
- The legacy `Knowledge` placeholder.
- Legacy Sidebar paths.

## 13. Known Limitations
- Existing screens like `OpportunityBoard` and `ContactList` are now accessible via the new Workspace routes (`/opportunities`, `/people`), but their internal architectures have not yet been rebuilt to match the new nested design. This is expected and deferred to upcoming phases.
