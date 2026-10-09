# NetworkOS Contact 360 Architecture

## 1. Core Principle
Contact 360 is NOT a traditional CRM profile page. It is a highly contextual **Intelligence Command Center** dedicated to a specific relationship. It unifies Person/Company intelligence with the Bi-Directional Value engine and current actionable context.

## 2. Workspace Structure

The workspace must be organized around the core founder questions: "Who are they?", "What is our relationship?", "How do we help each other?", and "What is happening now?".

### 1. Identity & Overview (The "Who")
- Person Intelligence (Role, Background, Priorities).
- Company Intelligence (Market, Stage, Priorities).
- Embedded `TrustBadge` labels across all assertions.

### 2. Bi-Directional Value Engine
This is a first-class business concept replacing generic note fields.
- **"How Can They Help Us?"**
  - Identifies relationship vectors: Customer, Partner, Referral, Investor, Connector.
- **"How Can We Help Them?"**
  - Mapped directly to our Capability/Product/Service knowledge layer.
  - Exposes initial hypotheses for solution matching.

### 3. Relationship Engine
- Relationship Strength metrics.
- Interaction History and Meeting velocity.
- Known shared connections (Network Map overlap).
- Founder's personal relationship notes.

### 4. Intelligence & Evidence
- Active Signals (e.g., funding rounds, job changes).
- Evidence linking for all AI-derived inferences.

### 5. Current Context (The "Right Now")
Consolidates the immediate operational reality:
- Upcoming calendar events.
- Recent emails / CRM context.
- Pending founder actions related to this contact.

## 3. Embedded Workflows & Exits

Contact 360 serves as the launchpad for downstream workflow transitions:

- **Meeting Prep:** Context transitions seamlessly into the `Meeting Workspace` (`/contacts/:id/meetings/new`).
- **Opportunity Generation:** Validated Needs mapped within Contact 360 flow into the `Opportunity Engine`.

## 4. UI/UX Paradigm
Rather than relying on flat tabs that hide information, Contact 360 should utilize a dashboard-like command center layout, allowing the founder to perceive the Relationship, the Value Match, and the Current Context simultaneously without losing narrative continuity.
