# Phase 4 Opportunity & Network Matching Reconciliation

## A. Wireframe → Screen Mapping
- `19_solution_matching.png` -> Solution Matching (`/opportunities/:id/solutions`)
- `20_buyer_partner_path.png` -> Buyer/Partner Path (`/opportunities/:id/path`)
- `21_opportunity_board.png` -> Opportunity Board (`/opportunities/board`)
- `24_network_map.png` -> Network Map & Matches (`/network/map` and `/network/matches/:id`)
- `16_message_human_review.png` -> Message Human Review (`/tasks/messages` or `/opportunities/:id/intro`)

## B. Screen → Route Mapping
- Solution Matching: `/opportunities/:id/solutions`
- Buyer/Partner Path: `/opportunities/:id/path`
- Opportunity Board: `/opportunities/board`
- Network Matches: `/network/matches/:id`
- Introduction Review: `/opportunities/:id/intro`

## C. Screen → Entity Mapping
- Opportunity (Need, Status, Path)
- Solution Candidate (Internal KB Match vs External Network Match)
- Network Match (Match Ranking, Relationship Strength, "Why This Match?")
- Introduction Draft (Content, Status)

## D. Screen → API Dependency Mapping
- `GET /api/opportunities/:id/solutions`
- `PATCH /api/opportunities/:id/path`
- `GET /api/opportunities/pipeline`
- `GET /api/network/matches/:id`
- `GET /api/messages/drafts/:id`
- `POST /api/messages/approve/:id`

## E. Workflow State Transitions
- VALIDATED_NEED -> MATCHING_SOLUTIONS -> PATH_SELECTED -> PIPELINE
- MATCHING_SOLUTIONS -> CANDIDATE_REVIEW -> FOUNDER_APPROVED -> INTRO_DRAFTED -> INTRO_APPROVED

## F. Founder Approval Boundaries
1. **Solution Selection:** AI recommends candidate solutions. Founder must select or dismiss them.
2. **Path Selection:** AI recommends path. Founder confirms.
3. **Network Match Approval:** AI ranks matches and explains "Why?". Founder explicitly approves a match to initiate an introduction.
4. **Message Approval:** AI drafts the intro. Founder edits and approves before it is marked ready to send.

## G. Mock API Requirements
- Realistic mock data for Solution Candidates, clearly indicating FACT vs INFERENCE.
- Match ranking structure (Match Score, Relationship Strength, Capability Fit).
- Introduction draft with inline editable text.

## H. Loading / Error / Empty / Partial States
- Must support Empty state if no network matches exist.
- Loading states for all pages.
- Error state for API failure.

## I. Navigation Transitions
- `Validate Need` -> `Solution Matching`
- `Solution Matching` -> `Buyer/Partner Path`
- `Buyer/Partner Path` -> `Opportunity Board`
- `Opportunity Board` -> `Network Match Detail`
- `Network Match Detail` -> `Introduction Draft`

## J. Evidence Requirements
- Evidence links on candidate solutions and match reasons ("Why This Match?") must open the `GlobalEvidenceDrawer`.

## K. Backend Contract Assumptions
- Endpoints use standard REST.
- Match ranking objects contain discrete fit dimensions (e.g., `capabilityFit`, `strategicRelevance`).

## L. Any Wireframe Conflicts
- None identified prior to implementation.
