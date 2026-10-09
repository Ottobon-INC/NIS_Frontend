# NetworkOS Screen Reclassification

This document reclassifies the existing 26 screens from the original implementation into the target Contextual Workspace architecture.

| Original Screen | Target Classification | Target Destination / Role |
| :--- | :--- | :--- |
| **01 Executive Dashboard** | TRUE WORKSPACE | Founder Intelligence Cockpit (incorporates Decision Queue) |
| **02 Add Contact** | MODAL / DRAWER | Quick Action accessible globally |
| **03 Identify Person** | WORKFLOW STEP | Nested in Contact Intake flow |
| **04 Relationship Context** | MERGE | Pillar within Contact 360 Workspace |
| **05 Contact 360** | TRUE WORKSPACE | The core Relationship Intelligence Hub |
| **06 Research Priority** | MERGE / REMOVE | Merged into Founder Decision Queue |
| **07 Public Research** | MERGE | Pillar within Contact 360 Workspace |
| **08 Research Dataset** | DRAWER | Deep-dive accessible from Contact 360 |
| **09 Evidence Layer** | GLOBAL COMPONENT | `GlobalEvidenceDrawer` (Retain) |
| **10 Person & Company Intel** | MERGE | Core identity block in Contact 360 |
| **11 Potential Roles** | MERGE | Part of "How They Help Us" in Contact 360 |
| **12 Why Them / Why Us** | MERGE | The Bi-Directional Value engine in Contact 360 |
| **13 Products & Services KB** | TRUE WORKSPACE | Capability Intelligence Layer |
| **14 Hypothesis Analysis** | WORKFLOW STEP | Foundational layer of Opportunity Workspace |
| **15 Conversation Brief** | WORKSPACE VIEW | Nested under Contact 360 -> Meeting Workspace |
| **16 Message Human Review** | FOUNDER DECISION TASK| Nested in Founder Decision Queue / Opportunity Workspace |
| **17 Conversation Capture** | WORKSPACE VIEW | Nested under Meeting Workspace |
| **18 Validate Need** | WORKSPACE VIEW | Trusted Context generation (versioned) |
| **19 Solution Matching** | WORKSPACE VIEW | Step 1 of the Opportunity Workspace |
| **20 Buyer/Partner Path** | MERGE | Inline decision within Opportunity Workspace |
| **21 Opportunity Board** | REMOVE AS STANDALONE | Pipeline tracking moves downstream to CRM context |
| **22 Outcome Tracking** | FOUNDER DECISION TASK| Nested in Opportunity / Decision Queue |
| **23 Ecosystem Event** | MERGE | Embedded within the Founder Intelligence Cockpit |
| **24 Network Map** | WORKSPACE VIEW | Nested deep visualization within Opportunity Match |
| **25 Cross-Client Intel** | MERGE | Intelligence signals embedded in Opportunity Match |
| **26 Navigation Global UI** | REFACTOR | Restructure Sidebar to reflect Global Workspaces only |
