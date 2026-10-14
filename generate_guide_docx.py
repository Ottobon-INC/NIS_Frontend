import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_document():
    doc = docx.Document()

    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Palette
    COLOR_PRIMARY = RGBColor(24, 58, 120)     # Deep Navy Blue (#183A78)
    COLOR_SECONDARY = RGBColor(37, 99, 235)   # Tech Blue (#2563EB)
    COLOR_TEXT = RGBColor(30, 41, 59)         # Slate 800 (#1E293B)
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate 500 (#64748B)
    COLOR_ACCENT = RGBColor(13, 148, 136)     # Teal (#0D9488)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = COLOR_TEXT
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    # Helpers for XML manipulation
    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_table_borders(table, hex_color="CBD5E1"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{hex_color}"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:insideV w:val="none"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEXT
        return p

    def add_callout(text, title="KEY TAKEAWAY", hex_border="2563EB", hex_bg="EFF6FF"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, hex_bg)
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{hex_border}"/>'
            f'<w:top w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r_title = p.add_run(f"📌 {title}: ")
        r_title.bold = True
        r_title.font.color.rgb = COLOR_PRIMARY
        r_title.font.size = Pt(10.5)

        r_text = p.add_run(text)
        r_text.font.size = Pt(10.5)
        r_text.font.color.rgb = COLOR_TEXT
        doc.add_paragraph() # Spacing

    def add_styled_table(headers, rows, col_widths=None):
        tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl)

        # Header Row
        hdr_cells = tbl.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            set_cell_background(hdr_cells[i], "1E293B")
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=120, right=120)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(10)

        # Data Rows
        for r_idx, row_data in enumerate(rows):
            row_cells = tbl.rows[r_idx + 1].cells
            bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.line_spacing = 1.1
                p.paragraph_format.space_after = Pt(0)
                for r in p.runs:
                    r.font.size = Pt(9.5)
                    r.font.color.rgb = COLOR_TEXT

        if col_widths:
            for row in tbl.rows:
                for c_idx, w in enumerate(col_widths):
                    row.cells[c_idx].width = Inches(w)

        doc.add_paragraph() # spacing
        return tbl

    # ==================== COVER / TITLE SECTION ====================
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(36)
    title_p.paragraph_format.space_after = Pt(6)
    r_title = title_p.add_run("NetworkOS (NIS)")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(28)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(16)
    r_sub = sub_p.add_run("Complete Frontend & Backend System Architecture, Current Implementation Status, and Step-by-Step Next Steps Guide")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(15)
    r_sub.font.color.rgb = COLOR_SECONDARY

    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.LEFT
    meta_info = [
        ("Project Name", "NetworkOS / Network Intelligence System (Ottobon-INC)"),
        ("Document Audience", "Founders, Product Managers, Frontend & Backend Engineers"),
        ("System Architecture Scope", "Frontend (React/Vite/TS) & Backend (FastAPI/Postgres/LangChain/Redis)"),
        ("Document Purpose", "Clear, simple explanation of the full system & actionable guide to proceed")
    ]
    for idx, (label, val) in enumerate(meta_info):
        r_cells = meta_tbl.rows[idx].cells
        r_cells[0].text = label
        r_cells[1].text = val
        set_cell_background(r_cells[0], "F1F5F9")
        set_cell_background(r_cells[1], "FFFFFF")
        set_cell_margins(r_cells[0], top=60, bottom=60, left=100, right=100)
        set_cell_margins(r_cells[1], top=60, bottom=60, left=100, right=100)
        r_cells[0].paragraphs[0].runs[0].font.bold = True
        r_cells[0].paragraphs[0].runs[0].font.size = Pt(9.5)
        r_cells[1].paragraphs[0].runs[0].font.size = Pt(9.5)

    doc.add_paragraph()
    doc.add_page_break()

    # ==================== TABLE OF CONTENTS ====================
    add_h1("Table of Contents")
    toc_items = [
        ("1. Executive Summary & The Big Picture", "What NetworkOS is and why it exists"),
        ("2. The Core Philosophy: Founder Control & Trust UX", "How AI assists without hallucinating or overstepping"),
        ("3. Frontend Architecture & Screen Walkthrough", "Visual journey across every screen in simple words"),
        ("4. Backend Architecture & Intelligence Engine", "FastAPI, PostgreSQL, Redis, Scrapers & AI Evidence Engine"),
        ("5. How Frontend and Backend Talk to Each Other", "Real API vs Mock Mode and active integration points"),
        ("6. Gap Analysis: What is Built vs. What Remains", "Detailed comparison table of screen-by-screen readiness"),
        ("7. Step-by-Step Guide for the 'Further Process'", "Prioritized roadmap and exact steps to proceed"),
        ("8. Developer Onboarding & Running Locally", "Commands, setup steps, and environment configuration"),
        ("9. Summary & Decision Sign-off", "Deliverables checklist and team action items")
    ]
    for title, desc in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(f"• {title}: ")
        r1.bold = True
        r1.font.color.rgb = COLOR_PRIMARY
        r2 = p.add_run(desc)
        r2.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # ==================== 1. EXECUTIVE SUMMARY ====================
    add_h1("1. Executive Summary & The Big Picture")
    p1 = doc.add_paragraph(
        "NetworkOS (also known as the Network Intelligence System or NIS) is a specialized "
        "relationship intelligence and commercial opportunity orchestration platform built specifically for founders and executive leaders. "
        "In simple terms, traditional CRMs (like Salesforce or HubSpot) are passive rolodexes: they store phone numbers, email addresses, "
        "and deal stages after you manually type them in. They do not think, they do not read between the lines, and they do not proactively find business for you."
    )
    p2 = doc.add_paragraph(
        "NetworkOS does the exact opposite. It acts as an active intelligence pre-processor for the founder. "
        "When you paste a single LinkedIn profile URL or upload meeting notes, NetworkOS automatically researches that person across the public web, "
        "extracts their verified domain expertise, identifies real business pain points, compares those pain points against what your company can actually deliver (Ottobon capabilities), "
        "and drafts a tailored, high-converting introduction or proposal—all while keeping the founder in 100% control before any message is sent."
    )

    add_callout(
        "NetworkOS is NOT just another CRM. It is an intelligent co-pilot that turns raw networking links into concrete, high-margin client deals, "
        "strategic partnerships, and warm introductions with verifiable evidence.",
        title="THE SIMPLE DEFINITION"
    )

    # Core Value Pillars Table
    headers_pillars = ["Feature Area", "What Traditional Tools Do", "What NetworkOS Does Instead"]
    rows_pillars = [
        ["Contact Ingestion", "Manual data entry or basic contact scrapers.", "Drop a LinkedIn link -> Autonomous multi-source research across web footprints."],
        ["Profile Understanding", "Displays job title and company name.", "Calculates NetworkOS Tier (1, 2, or 3), Provenance (verified current), and SME status."],
        ["Opportunity Detection", "Wait for someone to submit an inbound lead form.", "AI formulates 5 commercial hypotheses: Smallest solvable problem, margin projections, and 'Why Now?'."],
        ["Meeting Notes", "Static text field buried in a contact record.", "AI extracts customer pains, explicit requirements, and referenced colleagues into 'Trusted Context'."],
        ["Outreach & Matching", "Blast generic email templates.", "Matches client problems to Ottobon capabilities, selects warm network paths, and drafts tailored intros."]
    ]
    add_styled_table(headers_pillars, rows_pillars, [1.4, 2.3, 2.8])

    # ==================== 2. CORE PHILOSOPHY ====================
    add_h1("2. The Core Philosophy: Founder Control & Trust UX")
    p = doc.add_paragraph(
        "The most critical architectural principle of NetworkOS is the concept of Founder Control and Provenance Tracking. "
        "Artificial Intelligence is powerful, but it can hallucinate or assume things that are untrue. In executive networking, "
        "sending the wrong message or making false assumptions can destroy a multi-million-dollar relationship."
    )
    p = doc.add_paragraph(
        "Therefore, NetworkOS enforces a strict Golden Rule across both the frontend and backend:"
    )

    add_callout(
        "INTELLIGENCE  -->  CONTEXT  -->  TRUST  -->  DECISION  -->  ACTION  -->  OUTCOME  -->  LEARNING\n\n"
        "1. The AI gathers raw intelligence.\n"
        "2. The system labels every insight with a Trust Level (FACT, SIGNAL, INFERENCE, or HYPOTHESIS).\n"
        "3. Every AI insight links back to source evidence via the Global Evidence Drawer.\n"
        "4. The system NEVER autonomously executes an action (e.g., sending an email or confirming a deal).\n"
        "5. The founder makes the final decision at explicit review gates.",
        title="THE GOLDEN PIPELINE",
        hex_border="0D9488",
        hex_bg="F0FDFA"
    )

    add_h2("The 4 Trust Labels Explained Simply")
    trust_headers = ["Trust Label", "What It Means in Plain English", "Visual Color in UI", "Example in the App"]
    trust_rows = [
        ["FACT", "Directly verified and unquestionable.", "Solid Green", "Sarah Connor is the CIO of Cyberdyne (confirmed on official site)."],
        ["SIGNAL", "Observed indicator or event in the market.", "Blue", "Company raised Series B funding 2 weeks ago; posted 5 DevOps job ads."],
        ["INFERENCE", "Logical deduction made by connecting dots.", "Amber / Orange", "They are struggling with monolith scaling due to recent job postings."],
        ["HYPOTHESIS", "An unverified opportunity proposal.", "Purple", "Ottobon could offer a 120-hour cloud architecture refactor sprint at $15k."]
    ]
    add_styled_table(trust_headers, trust_rows, [1.3, 2.4, 1.2, 1.6])

    # ==================== 3. FRONTEND ARCHITECTURE ====================
    add_h1("3. Frontend Architecture & Screen Walkthrough")
    p = doc.add_paragraph(
        "The frontend application (`NIS_Frontend`) is built using modern web standards: React 18, TypeScript, Vite, "
        "TanStack Query (React Query for high-performance server caching), and React Router v6. "
        "It features a clean, executive-level design system with zero visual clutter."
    )

    add_h2("3.1 Component & Layout Architecture")
    p = doc.add_paragraph(
        "The frontend is organized around unified, reusable layout structures:"
    )
    p_bullets = [
        ("AppShell", "The master container providing the global header, sidebar navigation, and evidence drawer overlay."),
        ("Sidebar Navigation", "Quick routing between People, Opportunities, Capabilities, Network Map, and Founder Settings."),
        ("TopNavigation", "Shows workspace breadcrumbs, quick search, and global system notifications."),
        ("GlobalEvidenceDrawer", "A slide-over drawer accessible from anywhere in the app. Whenever a user clicks on an insight with an evidence link, this drawer slides open to reveal the exact source URL, retrieved timestamp, and raw text excerpt.")
    ]
    for title, desc in p_bullets:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(f"• {title}: ")
        r.bold = True
        p.add_run(desc)

    add_h2("3.2 Step-by-Step Screen Walkthrough (User Journey)")
    p = doc.add_paragraph(
        "Here is what happens on every screen from the moment a user opens the application:"
    )

    screens = [
        ("1. People Workspace (/people)",
         "The main launchpad for contacts. Users can view all ingested contacts in a sleek table showing Name, Title, Company, Research Status (PROCESSING, IDENTIFIED, INTELLIGENCE_READY), and Last Updated timestamp. Clicking '+ Add Contact' opens a simple modal where the user pastes a LinkedIn profile URL."),

        ("2. Identify Person Gate (/contacts/:id/identify)",
         "Immediately after a LinkedIn URL is submitted, the backend rapidly parses the basic identity. This screen presents a clean card: 'Sarah Connor - Chief Information Officer at Cyberdyne Systems' with an AI Confidence badge (HIGH/MEDIUM/LOW). The founder can click 'Confirm Identity' to approve deep research, or 'Reject / Correct' to fix errors."),

        ("3. Contact 360° Workspace (/people/:id)",
         "The crown jewel of the system. Once the AI research worker finishes, this screen renders a multi-section executive dossier:\n"
         "  a) Executive Snapshot: Name, company, location, and NetworkOS Tier (Tier 1 = Enterprise C-Suite, Tier 2 = VP/Director, Tier 3 = Practitioner).\n"
         "  b) 5 Commercial Opportunity Questions: Automatically answers: (1) Domain expertise, (2) Opportunity category, (3) Smallest solvable problem, (4) Financial feasibility (e.g. $5-$10/hr offshore cost vs $10k-$20k project price = 60%+ margin), and (5) Proposed first engagement sprint.\n"
         "  c) Full Markdown Commercial Report: A deeply articulated executive brief rendered in rich typography.\n"
         "  d) Bi-Directional Value Exchange: Two side-by-side cards: 'How They Help Us' (mentorship, contract lead, advisory) and 'How We Help Them' (engineering sprint, AI automation).\n"
         "  e) Intelligence History & Evidence Links: Timeline of every research event, meeting note, and document source."),

        ("4. Intelligence Transcript Workspace (/people/:id/transcript)",
         "Allows technical or analytical users to audit the exact raw data fetched by backend scrapers before it was summarized by the LLM."),

        ("5. Meeting Workspaces (/meetings/:id/*)",
         "Three connected screens for managing founder meetings:\n"
         "  • Meeting Brief: Generated before the meeting. Provides talking points, icebreakers, and hypotheses to test during the call.\n"
         "  • Meeting Capture: Ingests raw meeting transcripts or handwritten notes.\n"
         "  • Meeting Intelligence: AI automatically pulls out client problems, hard requirements, and mentioned people.\n"
         "  • Trusted Context: The founder clicks 'Validate' on good findings, locking them into permanent institutional memory."),

        ("6. Opportunities & Matching Workspace (/opportunities/*)",
         "Where deals come alive. Shows opportunities moving through a clear lifecycle:\n"
         "  • Opportunity Board: Kanban-style pipeline (Validated -> Solution Matching -> Path Defined -> Active Pipeline -> Outcome).\n"
         "  • Solution Matching: Matches verified customer pain points against Ottobon's service catalog (e.g., matching a client's legacy latency problem to Ottobon's Cloud Modernization service).\n"
         "  • Network Matching: Identifies who in the founder's 1st or 2nd-degree network can make the warmest introduction."),

        ("7. Introductions & Message Review (/opportunities/:id/introduction)",
         "The AI generates an introduction draft connecting Person A to Person B. The draft cites shared context and mutual benefit. The founder reviews, edits, and clicks 'Approve to Send'. Note: NetworkOS never sends emails autonomously; it queues them for human verification."),

        ("8. Capability Workspace (/capabilities)",
         "The knowledge repository representing Ottobon-INC. Holds descriptions of Services (custom software, AI engineering), Products, Domain Expertise, Industries served, and Case Studies.")
    ]

    for title, desc in screens:
        add_h3(title)
        p = doc.add_paragraph(desc)
        p.paragraph_format.space_after = Pt(6)

    # ==================== 4. BACKEND ARCHITECTURE ====================
    add_h1("4. Backend Architecture & Intelligence Engine")
    p = doc.add_paragraph(
        "The backend (`NIS_Backend`) is an asynchronous, production-ready micro-service built with Python 3.12, "
        "FastAPI, SQLAlchemy 2.0 (Asyncpg), PostgreSQL (hosted on Supabase), Redis, and LangChain with OpenAI GPT models."
    )

    add_h2("4.1 Core Backend Tech Stack")
    headers_tech = ["Component", "Technology", "What Role It Plays"]
    rows_tech = [
        ["Framework", "FastAPI (Python 3.12)", "Ultra-fast asynchronous REST API with automatic Swagger docs."],
        ["Database", "PostgreSQL 15 (Supabase)", "Relational database storing contacts, identities, evidence, runs, and knowledge."],
        ["ORM", "SQLAlchemy 2.0 (Async)", "Asynchronous database interaction using async/await patterns."],
        ["Migrations", "Alembic", "Tracks and executes database schema updates."],
        ["Background Workers", "FastAPI BackgroundTasks / Redis", "Runs web scraping and LLM synthesis without freezing user requests."],
        ["LLM Orchestration", "LangChain + OpenAI (GPT-4o)", "Structured schema extraction for Executive Snapshot and Commercial Reports."],
        ["Web Intelligence", "HTTPX / DuckDuckGo / AgentReach", "Autonomous web searching and scraping with SSRF security protection."]
    ]
    add_styled_table(headers_tech, rows_tech, [1.5, 2.2, 2.8])

    add_h2("4.2 Database Schema Explained in Plain English")
    p = doc.add_paragraph(
        "The PostgreSQL database (`schema.sql`) contains 12 core tables designed for high integrity and traceability:"
    )

    schema_tables = [
        ("contacts", "Represents a human being in the network. Stores full name, current title, company, email, phone, location, profile URL, and status (NEW, RESEARCHING, READY). Includes organization_id for multi-tenant isolation."),
        ("external_identities", "Links multiple digital handles to one contact (e.g. LinkedIn URL, Twitter handle, GitHub username, corporate email)."),
        ("research_sources", "Registry of all research tools available to the system (e.g., general_web, duckduckgo, agent_reach), their priority (P0, P1, P2), and whether they require API keys."),
        ("research_runs", "A single research lifecycle session triggered for a contact. Tracks overall status (QUEUED, RUNNING, COMPLETED, FAILED)."),
        ("research_tasks", "The individual sub-jobs under a run. For example, Task 1 searches DuckDuckGo for news; Task 2 fetches the company homepage."),
        ("source_results", "The raw data returned by a scraper. Stores the source URL, HTTP status code, extracted plain text, and JSON metadata."),
        ("evidence", "Discrete, audited claims linked to source results. Stores the claim text, trust level (FACT, SIGNAL, INFERENCE, HYPOTHESIS), and confidence score."),
        ("company_profiles, services, products, capabilities, case_studies", "Ottobon's internal knowledge base tables. Used to match external customer problems with internal delivery solutions.")
    ]
    for tbl, desc in schema_tables:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(f"• Table '{tbl}': ")
        r.bold = True
        p.add_run(desc)

    add_h2("4.3 The 5-Step Intelligence Extraction Pipeline")
    p = doc.add_paragraph(
        "Here is the exact step-by-step technical lifecycle when a user submits a LinkedIn link:"
    )

    add_callout(
        "Step 1: Ingestion & URL Normalization\n"
        "The API receives the LinkedIn URL, trims trailing slashes, ensures HTTPS, and extracts the name slug (e.g. 'john-doe' -> 'John Doe').\n\n"
        "Step 2: Orchestration & Research Plan Generation\n"
        "ResearchOrchestrator inspects enabled sources in `research_sources` and creates `ResearchTask` records for web searches.\n\n"
        "Step 3: Background Worker Execution & Security Check\n"
        "The background worker picks up tasks. The URL security module (`url_security.py`) validates target URLs to prevent SSRF attacks (blocking internal network IPs). Scrapers fetch public web pages.\n\n"
        "Step 4: EvidenceEngine LLM Synthesis\n"
        "EvidenceEngine concatenates all scraped text and prompts OpenAI with the Pydantic schema `ExecutiveSnapshot`. It evaluates domain expertise, smallest solvable problem, pricing, and draft next steps.\n\n"
        "Step 5: Database Commit & 360 Delivery\n"
        "The extracted snapshot and full markdown report are committed into `source_results` and cached. When the frontend requests `/api/v1/contacts/:id/360`, the complete intelligence report is returned immediately.",
        title="AUTONOMOUS INTELLIGENCE PIPELINE",
        hex_border="183A78",
        hex_bg="F8FAFC"
    )

    # ==================== 5. INTEGRATION STATUS ====================
    add_h1("5. How Frontend and Backend Talk to Each Other")
    p = doc.add_paragraph(
        "The application has two operational modes controlled via `.env` in the frontend:"
    )
    p_modes = [
        ("Mock Mode (VITE_API_MODE=mock)", "The frontend uses Mock Service Worker (MSW) to intercept network calls and return simulated JSON data. Useful for rapid frontend UI polishing without running a backend or database."),
        ("Real Mode (VITE_API_MODE=real)", "MSW is deactivated. The frontend's `apiClient` (`src/services/api/core/client.ts`) makes real HTTP requests directly to FastAPI at `http://localhost:8080`.")
    ]
    for mode, desc in p_modes:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(f"• {mode}: ")
        r.bold = True
        p.add_run(desc)

    add_h2("What Is Already Connected Right Now (Active & Working)")
    p = doc.add_paragraph(
        "The Contact / People feature is currently 100% connected between frontend and backend in real mode:"
    )
    connected_items = [
        ("Creating Contacts", "POST /api/v1/contacts ingests the LinkedIn profile and writes to PostgreSQL."),
        ("Triggering AI Research", "POST /api/v1/contacts/{id}/research launches the background scraping and OpenAI Evidence Engine."),
        ("Checking Progress", "GET /api/v1/research/runs/{id} reports live progress to the frontend."),
        ("Identity Confirmation", "GET /api/v1/contacts/{id}/identify and PATCH /api/v1/contacts/{id}/identify confirm candidate details."),
        ("Full Contact 360", "GET /api/v1/contacts/{id}/360 loads the real Executive Snapshot, 5 Commercial Questions, and Full Markdown Report directly from PostgreSQL."),
        ("Cascade Deletion", "DELETE /api/v1/contacts/{id} completely purges the contact, identities, tasks, and results in one transaction.")
    ]
    for feat, desc in connected_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(f"✔ {feat}: ")
        r.bold = True
        r.font.color.rgb = RGBColor(16, 185, 129)
        p.add_run(desc)

    # ==================== 6. GAP ANALYSIS ====================
    add_h1("6. Gap Analysis: What is Built vs. What Remains")
    p = doc.add_paragraph(
        "To plan the further process effectively, here is the complete audit of every feature module in the system:"
    )

    headers_gap = ["System Module", "Frontend Status", "Backend Status", "Integration Status", "Action Needed"]
    rows_gap = [
        ["Contacts & Ingestion", "Complete UI", "Complete API & Models", "CONNECTED (Real Mode)", "No action needed (Fully working)"],
        ["Identify Person Gate", "Complete UI", "Complete API & Models", "CONNECTED (Real Mode)", "No action needed (Fully working)"],
        ["Contact 360° Profile", "Complete UI", "Complete API & Models", "CONNECTED (Real Mode)", "No action needed (Fully working)"],
        ["Company Knowledge Base", "Complete UI (/capabilities)", "Complete CRUD API (/knowledge)", "PARTIAL", "Wire frontend hooks to real /knowledge endpoints"],
        ["Meeting Brief & Capture", "Complete UI (/meetings)", "Pending endpoints", "MOCKED (MSW)", "Build Meeting models, transcript upload & parsing endpoints"],
        ["Trusted Context Store", "Complete UI (/context)", "Pending endpoints", "MOCKED (MSW)", "Build validation gate & trusted_context storage tables"],
        ["Opportunities Pipeline", "Complete UI (/opportunities)", "Pending endpoints", "MOCKED (MSW)", "Build opportunity CRUD & stage transition state machine"],
        ["Solution Matching Engine", "Complete UI (/matching)", "Pending endpoints", "MOCKED (MSW)", "Build algorithm linking client pain points to Ottobon services"],
        ["Warm Introductions", "Complete UI (/introduction)", "Pending endpoints", "MOCKED (MSW)", "Build LLM intro prompt generator & message review queue"],
        ["Network Map & Graph", "Complete UI (/network)", "Pending endpoints", "MOCKED (MSW)", "Build relationship graph endpoints (nodes & edges)"]
    ]
    add_styled_table(headers_gap, rows_gap, [1.3, 1.2, 1.2, 1.3, 1.5])

    # ==================== 7. STEP-BY-STEP FURTHER PROCESS ====================
    add_h1("7. Step-by-Step Guide for the 'Further Process'")
    p = doc.add_paragraph(
        "Here is the clear, prioritized execution roadmap to move NetworkOS from its current working foundation "
        "to a completely integrated, production-ready enterprise platform. We have broken this into 6 manageable phases:"
    )

    phases = [
        ("Phase 1: Wire Knowledge Base (Low Effort, High Impact)",
         "Goal: Connect the already-built backend Knowledge Base to the Frontend Capabilities workspace.\n"
         "  1. In `NIS_Frontend/src/services/api/capabilities.api.ts`, point endpoints to `/api/v1/knowledge/services`, `/products`, `/capabilities`, and `/case_studies`.\n"
         "  2. Populate Ottobon's real corporate services and capabilities in the database.\n"
         "  3. Result: The Capabilities Workspace (/capabilities) displays real company offerings instantly."),

        ("Phase 2: Meeting Intelligence Backend (Core Value)",
         "Goal: Enable founders to upload meeting transcripts and extract validated client pain points.\n"
         "  1. Create SQLAlchemy models: `Meeting`, `MeetingTranscript`, `ExtractedNeed`.\n"
         "  2. Implement backend endpoints: `POST /api/v1/meetings/:id/capture` and `GET /api/v1/meetings/:id/brief`.\n"
         "  3. Add an LLM extraction prompt in LangChain to parse problems and requirements from transcript text.\n"
         "  4. Implement `PATCH /api/v1/meetings/:id/needs/:need_id` so the founder can approve or reject extracted points.\n"
         "  5. Approved points are saved into the `trusted_context` table."),

        ("Phase 3: Opportunities Pipeline & Solution Match Engine",
         "Goal: Match validated problems with Ottobon capabilities to generate commercial pipeline deals.\n"
         "  1. Create models: `Opportunity`, `OpportunityNeed`, `OpportunitySolution`.\n"
         "  2. Implement endpoints: `GET /api/v1/opportunities/pipeline`, `GET /api/v1/opportunities/:id/solutions`.\n"
         "  3. Build the matching algorithm: Queries the `capabilities` table and uses OpenAI embeddings or prompt matching to rank top 3 Ottobon solutions for each verified client problem.\n"
         "  4. Wire `opportunities.api.ts` in frontend to replace mock data."),

        ("Phase 4: Warm Introduction Drafting & Approval Queue",
         "Goal: Give founders AI-drafted introduction messages ready for review.\n"
         "  1. Create model: `IntroductionDraft` (stores sender, receiver, match_id, draft_body, status: DRAFT / APPROVED_TO_SEND).\n"
         "  2. Implement `GET /api/v1/messages/drafts/:id` and `POST /api/v1/messages/approve/:id`.\n"
         "  3. Use OpenAI prompt that takes Contact A's profile, Contact B's profile, and the Opportunity summary to craft a concise, non-salesy warm intro.\n"
         "  4. Frontend button 'Approve to Send' updates status to `APPROVED_TO_SEND`."),

        ("Phase 5: Network Relationship Graph",
         "Goal: Visualize connections and second-degree introductions.\n"
         "  1. Create model: `RelationshipEdge` (from_contact_id, to_contact_id, strength: WEAK/MEDIUM/STRONG, interaction_count).\n"
         "  2. Implement `GET /api/v1/network/graph` returning `{ nodes: [...], edges: [...] }`.\n"
         "  3. Wire frontend `NetworkMap.tsx` to render the interactive graph."),

        ("Phase 6: Production Hardening & Global Real Mode",
         "Goal: Enterprise security, multi-tenancy, and autonomous background queues.\n"
         "  1. Authentication: Replace `Bearer mock-admin-token` with Supabase Auth or FastAPI JWT OAuth2.\n"
         "  2. Background Queues: Migrate FastAPI `BackgroundTasks` to Celery or Arq backed by the running Redis container for resilient retries.\n"
         "  3. Environment: Set `VITE_API_MODE=real` globally in frontend production builds.")
    ]

    for title, desc in phases:
        add_h2(title)
        p = doc.add_paragraph(desc)
        p.paragraph_format.space_after = Pt(6)

    # ==================== 8. DEVELOPER QUICK-START ====================
    add_h1("8. Developer Onboarding & How to Run Everything Locally")
    p = doc.add_paragraph(
        "Both projects are lightweight and easy to start on any Windows, Mac, or Linux machine."
    )

    add_h2("8.1 Running the Backend (FastAPI)")
    p = doc.add_paragraph("Open a terminal in `NIS_Backend` and run:")
    cmd_backend = doc.add_paragraph()
    cmd_backend.paragraph_format.left_indent = Inches(0.3)
    r = cmd_backend.add_run(
        "# Activate Virtual Environment\n"
        ".\\venv\\Scripts\\Activate.ps1    # On Windows\n"
        "# Or: source venv/bin/activate    # On Mac/Linux\n\n"
        "# Install dependencies\n"
        "pip install -r requirements.txt\n\n"
        "# Start the API server on port 8080\n"
        "uvicorn app.main:app --port 8080 --reload"
    )
    r.font.name = 'Consolas'
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(30, 41, 59)

    p = doc.add_paragraph("Once running, verify at:")
    p_links = doc.add_paragraph("• Interactive Swagger API Docs: http://localhost:8080/docs\n• Health Status: http://localhost:8080/health")

    add_h2("8.2 Running the Frontend (React + Vite)")
    p = doc.add_paragraph("Open a second terminal in `NIS_Frontend` and run:")
    cmd_frontend = doc.add_paragraph()
    cmd_frontend.paragraph_format.left_indent = Inches(0.3)
    r = cmd_frontend.add_run(
        "# Install dependencies\n"
        "npm install\n\n"
        "# Start Vite development server\n"
        "npm run dev"
    )
    r.font.name = 'Consolas'
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(30, 41, 59)

    p = doc.add_paragraph("The frontend will be available at: http://localhost:5173")

    add_h2("8.3 Environment Variables Reference (.env)")
    env_headers = ["File Location", "Variable Name", "Example Value", "Purpose"]
    env_rows = [
        ["NIS_Frontend/.env", "VITE_API_BASE_URL", "http://localhost:8080", "Base URL pointing to FastAPI backend."],
        ["NIS_Frontend/.env", "VITE_API_MODE", "real (or mock)", "Controls whether Mock Service Worker is enabled."],
        ["NIS_Backend/.env", "POSTGRES_SERVER", "db.xxx.supabase.co", "PostgreSQL database hostname."],
        ["NIS_Backend/.env", "POSTGRES_PORT", "5432", "PostgreSQL connection port."],
        ["NIS_Backend/.env", "POSTGRES_DB", "postgres", "Database name."],
        ["NIS_Backend/.env", "POSTGRES_USER", "postgres", "Database user."],
        ["NIS_Backend/.env", "POSTGRES_PASSWORD", "********", "Database password."],
        ["NIS_Backend/.env", "OPENAI_API_KEY", "sk-proj-...", "OpenAI key for Evidence Engine LLM synthesis."]
    ]
    add_styled_table(env_headers, env_rows, [1.5, 1.8, 1.6, 1.6])

    # ==================== 9. SUMMARY & SIGN-OFF ====================
    add_h1("9. Summary & Decision Sign-off")
    p = doc.add_paragraph(
        "NetworkOS is built on strong, modular foundations. The frontend user experience is completely designed, "
        "tested, and functional. The backend contains a robust asynchronous database layer, secure web scraping, "
        "and a fully functioning AI Evidence Engine. The contact ingestion pipeline is already working end-to-end."
    )
    p = doc.add_paragraph(
        "By following the 6-phase roadmap outlined in Section 7, the engineering team can systematically complete "
        "the remaining backend endpoints (Meetings, Opportunities, Introductions) and achieve full production readiness."
    )

    add_callout(
        "Immediate Action Item:\n"
        "1. Review Phase 1 (Knowledge Base) and Phase 2 (Meeting Intelligence).\n"
        "2. Approve the data models for Meetings and Opportunities.\n"
        "3. Implement the FastAPI endpoints following the patterns established in `contacts.py`.",
        title="NEXT STEP FOR THE TEAM",
        hex_border="10B981",
        hex_bg="ECFDF5"
    )

    doc_path = r"c:\Users\poorv\OneDrive\Desktop\NetworkOS\NetworkOS_Frontend_Backend_Comprehensive_Guide.docx"
    doc.save(doc_path)
    print(f"Document successfully created at: {doc_path}")

    # Also save a copy inside NIS_Frontend/docs for easy team access
    doc_path_docs = r"c:\Users\poorv\OneDrive\Desktop\NetworkOS\NIS_Frontend\docs\NetworkOS_Frontend_Backend_Comprehensive_Guide.docx"
    doc.save(doc_path_docs)
    print(f"Copy successfully saved at: {doc_path_docs}")

if __name__ == "__main__":
    create_document()
