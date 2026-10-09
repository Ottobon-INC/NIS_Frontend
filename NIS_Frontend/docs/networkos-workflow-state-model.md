# NetworkOS Workflow State Model

## 1. Principles
Generic CRUD states (`CREATED`, `UPDATED`) are prohibited. All state transitions must map strictly to the Founder Relationship Intelligence workflow.

## 2. Core State Machines

### Contact Ingestion & Intelligence
- `INTAKE_PENDING` 
- `RESEARCHING` 
- `IDENTITY_CONFIRMATION` 
- `INTELLIGENCE_READY` 

### Meeting to Trusted Context
- `BRIEF_READY` 
- `CAPTURE_PENDING` 
- `EXTRACTING` 
- `VALIDATION_REQUIRED` 
- `TRUSTED_CONTEXT_STORED` (v1)
- `REVISION_REQUIRED` (Founder editing context)
- `TRUSTED_CONTEXT_UPDATED` (v2+)

### Opportunity Engine
- `OPPORTUNITY_IDENTIFIED` (Independent entity, drawing from Trusted Context)
- `MATCH_ENGINE_EVALUATING` 
- `CANDIDATE_SOLUTIONS_READY` 
- `PATH_SELECTED` 
- `RANKING_READY` 
- `REVIEW_REQUIRED` (Founder Action)
- `MATCH_APPROVED` 
- `MATCH_REJECTED` 

### Introduction & Feedback Loop
- `DRAFT_GENERATING` 
- `REVIEW_REQUIRED` 
- `APPROVED_TO_SEND` 
- `SENT` 
- `OUTCOME_LOGGED` 
- `FEEDBACK_PROCESSED` 
