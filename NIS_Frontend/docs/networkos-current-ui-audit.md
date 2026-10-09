# NetworkOS Current UI Audit

This audit evaluates the current frontend state (based on the provided screenshots) against the intended NetworkOS workflow.

## 1. Dashboard
- **CURRENT UI:** A basic "Executive Dashboard" showing "Contacts Requiring Action", "Researched Contacts", and a single "Recent Signals" box.
- **PROBLEM:** It does not function as a founder intelligence cockpit. It wastes massive screen real estate and only displays generic summary numbers rather than actionable items.
- **WHY IT CONFLICTS WITH WORKFLOW:** It fails to answer "WHAT requires my attention today?" regarding validations, meeting prep, or match approvals.
- **TARGET EXPERIENCE:** "Founder Intelligence Cockpit" aggregating items requiring decision (Validations, Match Approvals), relationship signals, active relationships, and recent outcomes.
- **ARCHITECTURAL CHANGE:** Rebuild as the Founder Decision Queue, prioritizing contextual workflow items (e.g., "Meeting with Sarah Connor requires preparation", "Opportunity at Cyberdyne has a network match requiring review").

## 2. Contacts
- **CURRENT UI:** A traditional CRM table showing Name, Company, Status, and Last Updated.
- **PROBLEM:** Purely a data grid. It exposes no intelligence, no relationship strength, and no actionable insights.
- **WHY IT CONFLICTS WITH WORKFLOW:** Contacts are the entry point to relationship intelligence, not a Rolodex.
- **TARGET EXPERIENCE:** A relationship intelligence entry point. Each row/card should expose relationship strength, important signals, open founder actions, and current context at a glance.
- **ARCHITECTURAL CHANGE:** Replace the generic table with an Intelligence List view that surfaces `HOW THEY HELP US` and open `TRUSTED CONTEXT` validations.

## 3. Tasks
- **CURRENT UI:** An empty page stating "Research and Message queues."
- **PROBLEM:** Disconnected and generic.
- **WHY IT CONFLICTS WITH WORKFLOW:** Decisions are contextual to a Contact or Opportunity. A disconnected task page divorces the decision from the intelligence required to make it.
- **TARGET EXPERIENCE:** Should become the Founder Decision Queue natively integrated into the Dashboard or specific workspaces.
- **ARCHITECTURAL CHANGE:** Deprecate as a standalone global route. Embed task triaging into the Founder Cockpit and Contact 360 workspaces.

## 4. Opportunities
- **CURRENT UI:** A generic CRM Kanban board with columns: VALIDATED, SOLUTION MATCHING, PATH DEFINED, PIPELINE, OUTCOME.
- **PROBLEM:** Looks and behaves like a traditional sales pipeline. Cards lack relationship context, evidence, and match logic visibility.
- **WHY IT CONFLICTS WITH WORKFLOW:** CRM is the *downstream* destination, not the active intelligence engine. Opportunity Engine must be a contextual workspace tied to a specific Contact/Meeting.
- **TARGET EXPERIENCE:** A deep workspace retaining originating context (Person, Company, Meeting, Trusted Context, Evidence) that facilitates internal/network matching and match ranking evaluation.
- **ARCHITECTURAL CHANGE:** Remove the global Kanban board. `Opportunity` must be a nested workspace accessed via `Contact 360` or the Founder Decision Queue.

## 5. Network Map
- **CURRENT UI:** A basic diagram showing Person -> Company -> Person (e.g., Sarah Connor -> Cyberdyne <- Alan Turing).
- **PROBLEM:** A decorative graph placeholder.
- **WHY IT CONFLICTS WITH WORKFLOW:** The map fails to answer "Who in our network can help solve this validated problem, and why?"
- **TARGET EXPERIENCE:** Network Intelligence workspace that exposes relationship strength, capabilities, industry connections, and potential match pathways.
- **ARCHITECTURAL CHANGE:** Redesign to support Match Ranking and "Why This Match?" explanations rather than a static visual diagram.

## 6. Products & Services
- **CURRENT UI:** Placeholder empty page.
- **PROBLEM:** Disconnected from the Opportunity Engine.
- **WHY IT CONFLICTS WITH WORKFLOW:** It is supposed to act as the internal capability knowledge layer used for Solution Matching ("HOW WE HELP THEM").
- **TARGET EXPERIENCE:** Capability Intelligence Layer.
- **ARCHITECTURAL CHANGE:** Rebuild as a structured ontology of capabilities that actively feeds the "Internal Match" and "Hybrid Match" engines.
