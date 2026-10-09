# NetworkOS Architecture Gap Analysis

This document evaluates the gap between the currently running Phase 1-5 frontend and the target Business Architecture.

## 1. Dashboard (Founder Intelligence Cockpit)
**CURRENT:** Basic cards with static numbers. Empty space. Disconnected signal widget.
**EXPECTED:** Founder Intelligence Cockpit. "WHAT NEEDS MY ATTENTION?". Prioritizes actionable decisions: validations, match approvals, important signals, and active opportunities.
**GAP:** High. Currently answers "What are our stats?" instead of prompting action + context.
**RECOMMENDED CHANGE:** Rebuild dashboard. Remove simple counters. Inject the Founder Decision Queue.

## 2. Tasks
**CURRENT:** Empty disconnected page.
**EXPECTED:** Merged into the Founder Decision Queue natively inside the Cockpit.
**GAP:** High. Task queue divorces the decision from the intelligence context.
**RECOMMENDED CHANGE:** Deprecate `/tasks` as a global generic route.

## 3. Opportunities
**CURRENT:** Generic CRM Kanban pipeline. Opportunity physical routing implies it's nested inside a meeting, or totally disconnected.
**EXPECTED:** An independent domain entity. Preserves references to Person, Meeting, and Trusted Context, but supports its own lifecycle (multiple matches, intros, outcomes).
**GAP:** Critical. The current pipeline board looks operational/downstream. It breaks the relationship continuity.
**RECOMMENDED CHANGE:** Remove global `/opportunities/board`. Restructure Opportunity as an independent workspace retaining origin context.

## 4. Trusted Context Store
**CURRENT:** Implied via routing transition after validation.
**EXPECTED:** A versioned, auditable, founder-approved domain object. Opportunity Engine consumes its current valid version.
**GAP:** Critical. Missing a dedicated UI vault and versioning logic.
**RECOMMENDED CHANGE:** Create the Trusted Context interface, allowing founder corrections and auditing.

## 5. Global Navigation
**CURRENT:** Exposes workflow steps (Tasks) alongside workspaces.
**EXPECTED:** Sidebar represents GLOBAL WORKSPACES only (Founder Intelligence, People, Opportunities, Network Intel, Capability Intel).
**GAP:** High.
**RECOMMENDED CHANGE:** Refactor sidebar navigation entirely.

## 6. Contact 360 Workspace
**CURRENT:** Tabbed generic profile.
**EXPECTED:** Intelligence Command Center unifying Bi-Directional Value, Relationship Engine, Current Context, and Signals.
**GAP:** Critical. Fails to expose "How can they help us" and "How can we help them".
**RECOMMENDED CHANGE:** Rip and replace the tab structure with a unified dashboard-style layout emphasizing Relationship Strength and Value Match.
