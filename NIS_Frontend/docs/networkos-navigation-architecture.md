# NetworkOS Navigation Architecture

## 1. Global Navigation (Sidebar)
The sidebar represents GLOBAL WORKSPACES only. It does not expose every workflow step.

**Recommended Sidebar:**
1. **Founder Intelligence** (The Cockpit / Decision Queue)
2. **People / Relationships** (Contact Directory)
3. **Opportunities** (Active pursuits)
4. **Network Intelligence** (Global ecosystem understanding)
5. **Capability Intelligence** (Products & Services KB)

## 2. Contextual Navigation (Deep Links)
Workflow steps occur contextually within their parent workspaces:
- Tasks (Validation, Matching, Intro Approval) are handled natively within the `Founder Decision Queue` (inside the Cockpit).
- Meeting, Validation, Matching, and Introductions occur natively inside `Contact 360` or `Opportunity` workspaces.

```text
/                                   (Founder Intelligence Cockpit)
/contacts                           (People / Relationships)
/contacts/:id                       (Contact 360)
/contacts/:id/meetings/:meetingId   (Meeting Workspace inside Contact)

/opportunities                      (Global Opportunity View)
/opportunities/:id                  (Independent Opportunity Workspace)
/opportunities/:id/matching         (Match Generation)

/network                            (Network Intelligence)
/capabilities                       (Capability Intelligence)
```
