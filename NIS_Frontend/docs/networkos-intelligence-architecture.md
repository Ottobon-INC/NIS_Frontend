# NetworkOS Intelligence Architecture

## 1. The Trust Hierarchy
NetworkOS operates on a strict trust hierarchy. Every piece of intelligence must be explicitly labeled and visually separated based on this spectrum:

1. **FACT:** Verifiable, immutable data (e.g., job title, company name).
2. **SIGNAL:** Observed external events (e.g., funding round, job change).
3. **INFERENCE:** AI interpretation derived directly from facts/signals (e.g., likely technical stack based on job history).
4. **HYPOTHESIS:** AI proactive suggestion requiring significant validation (e.g., "They might need SOC2 compliance").
5. **FOUNDER CONFIRMED:** Intelligence that has passed explicit human validation. Only this state can be safely written to the Trusted Context Store.

## 2. Evidence Engine Lineage
The system must maintain traceability for all AI-generated interpretation.

**Architecture:**
`RAW SOURCE → EVIDENCE → SIGNAL → AI INTERPRETATION → HYPOTHESIS / INFERENCE → FOUNDER VALIDATION → CONFIRMED CONTEXT`

- **Provenance:** Every `INFERENCE` or `HYPOTHESIS` object MUST contain an `evidenceId`.
- **Global Evidence Drawer:** The singular UI component responsible for displaying the relationship between the AI claim and the Source Fact.

## 3. Workflow Downstream Enforcement
- The **Opportunity Engine** can ONLY consume data from the **Trusted Context Store**.
- A Hypothesis must never bypass Validation.
- AI Recommendations inside Network Matching are inherently `HYPOTHESIS` state and cannot autonomously trigger an Introduction without explicit Founder Approval.
