# Phase 3 Meeting Reconciliation

## Wireframe 15: Conversation Brief
- **Route:** `/meetings/:id/brief`
- **Purpose:** Contextual preparation before the meeting.
- **Hierarchy:** Contact header, meeting objectives, suggested topics, and summarized intelligence.
- **CTA:** Capture Meeting (leads to `/meetings/:id/capture`).

## Wireframe 17: Conversation Capture
- **Route:** `/meetings/:id/capture`
- **Purpose:** Upload audio or transcript.
- **Hierarchy:** Upload zone, manual text entry, processing state visualization.
- **CTA:** Process/Upload (triggers async extraction).

## Wireframe 18: Validate Need
- **Route:** `/opportunities/:id/validate`
- **Purpose:** Founder validation of AI-extracted problems, requirements, and people.
- **Hierarchy:** 
  - Extracted Problem (Confidence, Evidence, Confirm/Reject)
  - Extracted Requirement (Confidence, Evidence, Confirm/Reject)
  - Extracted Person (Confidence, Evidence, Confirm/Reject)
- **CTA:** Confirm All / Finalize (transitions to Trusted Context / Solution Matching).
