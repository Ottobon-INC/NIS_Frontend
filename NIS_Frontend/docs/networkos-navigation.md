# NetworkOS Navigation Graph

## GLOBAL NAVIGATION (Sidebar)
* `/` -> Dashboard
* `/contacts` -> Contacts List
* `/tasks` -> Tasks & Priority (Research, Messages)
* `/opportunities/board` -> Opportunity Pipeline
* `/network/map` -> Network Map & Events
* `/knowledge` -> Products & Services KB

## CONTEXTUAL NAVIGATION & TABS
**Contact Context (`/contacts/:id`)**
* `Overview` (Default)
* `Intelligence` (Person & Company)
* `Relationship` (CRM context)
* `Research` (Signals)
* `Dataset` (Raw data)
* `Roles`
* `Why Them / Why Us`

**Meeting Context (`/meetings/:id`)**
* `Brief`
* `Capture`

**Opportunity Context (`/opportunities/:id`)**
* `Validate Needs`
* `Solution Matching`
* `Path (Buyer/Partner)`
* `Matches`
* `Outcome`

## WORKFLOW TRANSITIONS (Linear Journeys)

### Journey 1: Contact Ingestion
`Dashboard` -> `Add Contact` -> *(Wait for Backend)* -> `Identify Person` -> `Contact 360`

### Journey 2: Meeting to Extraction
`Contact 360` -> `Meeting Brief` -> `Meeting Capture` -> *(AI Extract Wait)* -> `Validate Need`

### Journey 3: Opportunity Creation
`Validate Need` -> `Solution Matching` -> `Buyer/Partner Path` -> `Opportunity Board`

### Journey 4: Network Match & Intro
`Opportunity Details` -> `Network Match` -> `Why This Match?` (Drawer) -> `Approve Intro` -> `Message Human Review` -> `Outcome Tracking`

## OVERLAYS / DRAWERS
* **Evidence Drawer:** Opens globally from any `EvidenceLink`.
* **Why This Match:** Drawer overlay on top of Network Match view.
* **Confirm/Reject Modals:** AI Founder Validation micro-interactions.
