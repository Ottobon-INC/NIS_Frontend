import { http, HttpResponse, delay, passthrough } from 'msw';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const handlers = [
  // Cockpit & Dashboard Stats mock
  http.get(`${API_BASE}/api/v1/cockpit/stats*`, async () => {
    if (import.meta.env?.VITE_MOCK_DASHBOARD === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json({
      pendingDecisions: 3,
      activeOpportunities: 3,
      networkNodes: 52,
      validatedNeeds: 1,
      introductionsSent: 4
    });
  }),

  http.get(`${API_BASE}/api/cockpit/stats*`, async () => {
    if (import.meta.env?.VITE_MOCK_DASHBOARD === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json({
      pendingDecisions: 3,
      activeOpportunities: 3,
      networkNodes: 52,
      validatedNeeds: 1,
      introductionsSent: 4
    });
  }),

  http.get(`${API_BASE}/api/dashboard*`, async () => {
    if (import.meta.env?.VITE_MOCK_DASHBOARD === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(800);
    return HttpResponse.json({
      stats: {
        actionRequired: 24,
        researched: 86,
        conversations: 12,
        openOpportunities: 18,
        outcomes: 7
      }
    });
  }),

  // Founder Cockpit Decision Queue mock
  http.get(`${API_BASE}/api/v1/cockpit/queue*`, async () => {
    if (import.meta.env?.VITE_MOCK_FOUNDER === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json({
      queue: [
        {
          id: 'dec-01',
          type: 'OPPORTUNITY_VALIDATION',
          priority: 'HIGH',
          title: 'Validate Detected Opportunity',
          subtitle: 'David Chen · Apex Financial Group',
          reason: 'AI inferred high-urgency compliance need with $100k+ budget signal.',
          actionUrl: '/opportunities/opp-fintech-fraud-02',
          createdAt: '2026-03-22T08:30:00Z'
        },
        {
          id: 'dec-02',
          type: 'INTRODUCTION_REVIEW',
          priority: 'HIGH',
          title: 'Approve Outbound Introduction Draft',
          subtitle: 'Rahul Dhamdhere · Global Logistics Corp',
          reason: 'Calibrated warm email intro drafted via Bhanu connection path.',
          actionUrl: '/messages/draft-01/review',
          createdAt: '2026-03-22T09:00:00Z'
        },
        {
          id: 'dec-03',
          type: 'NETWORK_MATCH_APPROVAL',
          priority: 'MEDIUM',
          title: 'Review Candidate Network Route',
          subtitle: 'Meridian Freight Solutions via Priya Sharma',
          reason: 'Single-hop connection detected with 4/5 relationship strength.',
          actionUrl: '/network/matches/match-03',
          createdAt: '2026-03-22T07:15:00Z'
        }
      ]
    });
  }),

  http.get(`${API_BASE}/api/founder/decisions*`, async () => {
    if (import.meta.env?.VITE_MOCK_FOUNDER === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(800);
    return HttpResponse.json([
      {
        id: 'task-1',
        type: 'VALIDATION_REQUIRED',
        title: 'Review Meeting Finding',
        personId: '99',
        opportunityId: 'opp-456',
        personName: 'Sarah Connor',
        companyName: 'Cyberdyne Systems',
        relatedEntityName: 'Legacy platform scaling',
        description: 'Meeting extraction detected a critical need regarding Legacy Monolith Scaling and SOC2 compliance blockers.',
        whyItMatters: 'If validated, this forms the Trusted Context required to initiate the Opportunity Engine for a Hybrid Match.',
        evidenceSummary: '3 sources (Transcripts & Email)',
        confidence: 87,
        status: 'PENDING',
        primaryActionLabel: 'Review Finding'
      },
      {
        id: 'task-2',
        type: 'MATCH_REVIEW_REQUIRED',
        title: 'Review Network Match',
        personId: '2',
        opportunityId: 'opp-789',
        personName: 'Alan Turing',
        companyName: 'Bletchley Corp',
        relatedEntityName: 'Opportunity: Crypto-Analysis Platform',
        description: 'Network Match Engine identified Alan as an 91% Hybrid Match based on expertise and our internal capability.',
        whyItMatters: 'Founder approval required before an introduction draft can be generated.',
        evidenceSummary: 'Past projects + Relationship graph',
        confidence: 91,
        status: 'PENDING',
        primaryActionLabel: 'Review Match'
      }
    ]);
  }),

  // Meeting Brief & Capture Mocks
  http.get(`${API_BASE}/api/v1/meetings/:id/brief*`, async ({ params }) => {
    if (import.meta.env?.VITE_MOCK_MEETINGS === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(500);
    return HttpResponse.json({
      meetingId: params.id,
      contactName: 'Rahul Dhamdhere',
      title: 'VP Engineering & Enterprise Architecture',
      company: 'Global Logistics Corp',
      meetingDate: '2026-03-24T15:00:00Z',
      objective: 'Explore autonomous ABAP migration pilot for Q3 deliverables.',
      talkingPoints: [
        'Acknowledge recent public modernization milestone at Global Logistics.',
        'Address specific technical bottleneck around custom SAP ECC table dependencies.',
        'Propose a 3-week sandbox proof-of-concept with zero production downtime.'
      ],
      relationshipContext: {
        strength: 4,
        connectedVia: 'Bhanu (Alumni / Professional)',
        lastInteraction: 'SAP Summit 2024'
      }
    });
  }),

  http.post(`${API_BASE}/api/v1/meetings/:id/capture*`, async ({ params }) => {
    if (import.meta.env?.VITE_MOCK_MEETINGS === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json({
      meetingId: params.id,
      status: 'PROCESSING',
      capturedAt: new Date().toISOString(),
      extractedNeedsCount: 3
    });
  }),

  http.get(`${API_BASE}/api/v1/meetings/:id/intelligence*`, async ({ params }) => {
    if (import.meta.env?.VITE_MOCK_MEETINGS === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(500);
    return HttpResponse.json({
      meetingId: params.id,
      findings: [
        {
          id: 'f-1',
          type: 'PROBLEM',
          claim: 'Team is struggling with legacy SAP ECC custom code regression.',
          evidenceQuote: "'We have 200 custom ABAP programs with zero active documentation.'",
          trustLevel: 'INFERENCE'
        },
        {
          id: 'f-2',
          type: 'REQUIREMENT',
          claim: 'Target solution must run on-premise or in sovereign VPC.',
          evidenceQuote: "'Data privacy policy forbids sending core ERP schemas outside EU boundary.'",
          trustLevel: 'CONFIRMED'
        }
      ]
    });
  }),

  // Contacts mock
  http.get(`${API_BASE}/api/contacts`, async () => {
    await delay(600);
    return HttpResponse.json([
      { id: '1', name: 'Rahul Mehta', title: 'VP Engineering', company: 'Acme Technologies', status: 'INTELLIGENCE_READY', lastUpdated: '2026-10-01' },
      { id: '2', name: 'Anita Rao', title: 'CTO', company: 'Globex Corp', status: 'IDENTIFIED', lastUpdated: '2026-10-06' },
      { id: '3', name: 'David Chen', title: 'Director of Platform', company: 'Initech', status: 'PROCESSING', lastUpdated: '2026-10-07' }
    ]);
  }),

  http.post(`${API_BASE}/api/contacts`, async () => {
    await delay(1000);
    return HttpResponse.json({ id: '99', status: 'PROCESSING' });
  }),

  // Simulating async polling
  http.get(`${API_BASE}/api/contacts/:id/status`, async ({ params }) => {
    await delay(500);
    // Artificially change state after polling a few times by using random or time logic
    // For simplicity, always return COMPLETED for the mock
    return HttpResponse.json({ id: params.id, status: 'COMPLETED' });
  }),

  http.get(`${API_BASE}/api/contacts/:id/identify`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      id: params.id,
      name: 'Sarah Connor',
      title: 'Chief Information Officer',
      company: 'Cyberdyne Systems',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/sarahconnor',
      confidence: 'HIGH'
    });
  }),

  http.patch(`${API_BASE}/api/contacts/:id/identify`, async () => {
    await delay(800);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/contacts/:id/360`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      id: params.id,
      name: 'Sarah Connor',
      title: 'Chief Information Officer',
      company: 'Cyberdyne Systems',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/sarahconnor',
      tier: 'Tier A',
      personIntelligence: {
        background: 'Former VP of Infrastructure at Globex. Focuses on security-first transformations. Currently evaluating modernization partners.',
        expertise: ['Cloud Architecture', 'Security Compliance', 'Enterprise Scaling', 'Application Infrastructure'],
        decisionInfluence: 'Primary decision maker for infrastructure and security tooling. Driving the vendor selection for app modernization.'
      },
      companyIntelligence: {
        industry: 'Enterprise Software / Defense',
        context: 'Rapidly scaling monolith struggling with peak loads. Mandated SOC2 compliance. Upcoming application infrastructure modernization in next 2 quarters.',
        growthSignals: 'Raised $50M Series B. Hiring heavily in DevOps.'
      },
      currentTrustedContext: [
        'Application infrastructure modernization is the current focus.',
        'Prefers vendor co-delivery model over complete outsourcing.',
        'Timeline: Next two quarters.'
      ],
      whatWeKnewBefore: {
        personBackground: 'Former VP of Infrastructure at Globex. Focuses on security-first transformations.',
        companyContext: 'Enterprise Software / Defense. Rapidly scaling monolith struggling with peak loads.'
      },
      whatWeLearned: {
        insights: [
          'Sarah is currently evaluating modernization partners.',
          'Their internal team is struggling with legacy infrastructure.',
          'She prefers vendors who can work alongside her existing engineering team.',
          'She expects a modernization initiative within the next two quarters.',
          'Sarah clarified that the initiative is focused specifically on application infrastructure rather than a complete cloud migration.'
        ],
        rawInputs: [
          {
            id: 'conv-1',
            sourceType: 'FOUNDER_CONVERSATION',
            content: '"Sarah mentioned they are evaluating modernization partners. The team is struggling with legacy infrastructure. She wants a vendor to work alongside her team, expecting to kick off in the next two quarters. Crucially, she clarified this is focused on application infrastructure, not a full cloud migration."',
            date: '2026-10-07T14:00:00Z'
          }
        ]
      },
      intelligenceHistory: [
        { id: 'h1', content: 'Discovered: Sarah is evaluating cloud modernization.', sourceType: 'EXTERNAL_RESEARCH', timestamp: '2026-10-01T09:00:00Z' },
        { id: 'h2', content: 'Conversation occurred: Informal meeting at SaaStr.', sourceType: 'FOUNDER_CONVERSATION', timestamp: '2026-10-07T14:00:00Z' },
        { id: 'h3', content: 'New information learned: Initiative is application infrastructure focused.', sourceType: 'FOUNDER_CONVERSATION', timestamp: '2026-10-07T14:05:00Z' },
        { id: 'h4', content: 'Founder validation: Confirmed application infrastructure scope.', sourceType: 'FOUNDER_NOTE', timestamp: '2026-10-07T14:10:00Z' },
        { id: 'h5', content: 'Current trusted context updated.', sourceType: 'SYSTEM_SIGNAL', timestamp: '2026-10-07T14:15:00Z' }
      ],
      evidenceList: [
        { id: 'ev-1', type: 'EXTERNAL_RESEARCH', title: 'Cyberdyne Series B Press Release', timestamp: '2026-10-01' },
        { id: 'ev-2', type: 'FOUNDER_CONVERSATION', title: 'Meeting Notes: SaaStr 2025', timestamp: '2026-10-07' }
      ],
      signals: [
        {
          id: 'sig-1',
          title: 'Cloud modernization strategy',
          description: 'Cyberdyne announced a major cloud modernization initiative.',
          whyItMatters: 'Indicates a potential budget and timeline for infrastructure overhauls.',
          confidence: 87,
          evidenceId: 'ev-cyberdyne-cloud',
          level: 'SIGNAL'
        }
      ],
      howTheyHelpUs: [
        {
          role: 'Customer',
          reasoning: 'Strong fit for our scaling solutions and compliance auditing capabilities.',
          level: 'HYPOTHESIS'
        }
      ],
      howWeHelpThem: [
        {
          need: 'Monolith Scaling',
          capability: 'Distributed Infrastructure Consulting',
          level: 'INFERENCE'
        },
        {
          need: 'SOC2 Compliance',
          capability: 'Security Audit & Compliance Platform',
          level: 'INFERENCE'
        }
      ],
      relationship: {
        strength: 'Strong',
        type: 'Met at SaaStr 2025',
        previousInteractions: 3,
        notes: 'Sarah is highly pragmatic. Does not like marketing fluff. Focus on technical specifics.'
      },
      currentContext: {
        recentMeetings: ['Initial Discovery (SaaStr)'],
        activeOpportunities: ['Legacy Migration / SOC2 Assessment']
      }
    });
  }),

  // --- Phase 3 Meeting Handlers ---
  http.get(`${API_BASE}/api/meetings/:id/brief`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      id: params.id,
      contactId: '99',
      contactName: 'Sarah Connor',
      company: 'Cyberdyne Systems',
      objectives: ['Understand their current migration status', 'Identify key stakeholders for the security review'],
      suggestedTopics: ['Recent cloud modernization strategy', 'Legacy monolith constraints'],
      recentSignals: ['Cyberdyne announced a $50M infrastructure upgrade'],
      relationshipContext: 'Met at SaaStr 2025. Expressed early interest in our security layer.'
    });
  }),

  http.post(`${API_BASE}/api/meetings/:id/capture`, async () => {
    await delay(1200);
    return HttpResponse.json({ jobId: 'job-123' });
  }),

  http.get(`${API_BASE}/api/meetings/jobs/:jobId/status`, async () => {
    await delay(800);
    // Simulating completion to advance workflow
    return HttpResponse.json({ id: 'job-123', status: 'EXTRACTED', opportunityId: 'opp-456' });
  }),

  // --- Phase 6C Meeting Intelligence Handlers ---
  http.get(`${API_BASE}/api/meetings/:id/intelligence`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      meetingId: params.id,
      contactId: '99', // Mocking Sarah Connor context
      findings: [
        {
          id: 'find-1',
          type: 'PROBLEM',
          content: 'Legacy monolith is slowing product releases.',
          evidence: '"Whenever we hit peak traffic, the database locks up and we drop connections." [04:12]',
          confidence: 85,
          status: 'AWAITING_VALIDATION',
          sourceMeetingId: params.id
        },
        {
          id: 'find-2',
          type: 'REQUIREMENT',
          content: 'Modernization expertise with minimal disruption.',
          evidence: '"Our CISO mandated that all new cloud vendors need SOC2 Type II by Q3." [11:45]',
          confidence: 90,
          status: 'AWAITING_VALIDATION',
          sourceMeetingId: params.id
        },
        {
          id: 'find-3',
          type: 'PERSON',
          content: 'CTO is involved in architecture decisions.',
          evidence: '"You will need to pass this through Miles in security." [12:05]',
          confidence: 75,
          status: 'AWAITING_VALIDATION',
          sourceMeetingId: params.id
        }
      ]
    });
  }),

  http.patch(`${API_BASE}/api/meetings/:meetingId/intelligence/:findingId`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  // --- Phase 6C Trusted Context Handlers ---
  http.get(`${API_BASE}/api/contacts/:id/trusted-context`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      items: [
        {
          id: 'tc-1',
          contactId: params.id,
          type: 'PROBLEM',
          currentVersion: 1,
          content: 'Legacy modernization is an active concern.',
          evidence: '"Whenever we hit peak traffic, the database locks up and we drop connections." [04:12]',
          sourceMeetingId: 'meet-1',
          history: [
            { version: 1, content: 'Legacy modernization is an active concern.', timestamp: '2026-10-07T10:00:00Z' }
          ]
        }
      ]
    });
  }),

  http.patch(`${API_BASE}/api/trusted-context/:itemId`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  // --- Phase 4 Opportunity & Match Handlers ---
  http.get(`${API_BASE}/api/opportunities/:id/solutions`, async () => {
    await delay(800);
    return HttpResponse.json({
      solutions: [
        {
          id: 'sol-1',
          name: 'Cyberdyne Security Audit',
          description: 'Internal security audit offering mapped directly to SOC2 requirement.',
          type: 'INTERNAL',
          matchScore: 92,
          trustLevel: 'INFERENCE',
          evidenceId: 'ev-1'
        },
        {
          id: 'sol-2',
          name: 'Alan Turing',
          description: 'World-class cryptographer in our network who recently consulted on SOC2 compliance.',
          type: 'NETWORK',
          matchScore: 88,
          trustLevel: 'HYPOTHESIS'
        }
      ]
    });
  }),

  http.patch(`${API_BASE}/api/opportunities/:id/path`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  // --- Phase 6D Opportunity Handlers ---
  http.get(`${API_BASE}/api/opportunities`, async () => {
    if (import.meta.env.VITE_MOCK_OPPORTUNITIES === 'false') {
      return passthrough();
    }
    await delay(800);
    return HttpResponse.json({
      opportunities: [
        {
          id: 'opp-1',
          title: 'Cyberdyne Legacy Modernization',
          personId: '99',
          personName: 'Sarah Connor',
          companyId: 'c-1',
          companyName: 'Cyberdyne Systems',
          problem: 'Legacy monolith is slowing product releases.',
          requirement: 'Modernization expertise with minimal disruption.',
          opportunityType: 'Digital Transformation',
          confidence: 85,
          status: 'CANDIDATE',
          createdAt: '2026-10-07T10:30:00Z',
          updatedAt: '2026-10-07T10:30:00Z',
          trustedContextIds: ['tc-1']
        }
      ]
    });
  }),

  http.get(`${API_BASE}/api/opportunities/:id`, async ({ params }) => {
    if (import.meta.env.VITE_MOCK_OPPORTUNITIES === 'false') {
      return passthrough();
    }
    await delay(800);
    return HttpResponse.json({
      id: params.id,
      title: 'Cyberdyne Legacy Modernization',
      personId: '99',
      personName: 'Sarah Connor',
      companyId: 'c-1',
      companyName: 'Cyberdyne Systems',
      relationshipId: 'rel-1',
      sourceMeetingId: 'meet-1',
      trustedContextIds: ['tc-1'],
      problem: 'Legacy monolith is slowing product releases.',
      requirement: 'Modernization expertise with minimal disruption.',
      timeline: 'Q3/Q4 2026',
      budgetSignal: '$50M Series B (infrastructure upgrade allocation)',
      opportunityType: 'Digital Transformation',
      confidence: 85,
      status: 'CANDIDATE',
      createdAt: '2026-10-07T10:30:00Z',
      updatedAt: '2026-10-07T10:30:00Z'
    });
  }),

  http.patch(`${API_BASE}/api/opportunities/:id/validate`, async () => {
    if (import.meta.env.VITE_MOCK_OPPORTUNITIES === 'false') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  // --- Phase 6E Capabilities & Matching Handlers ---
  http.get(`${API_BASE}/api/v1/knowledge/capabilities*`, async () => {
    if (import.meta.env?.VITE_MOCK_CAPABILITIES === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json([
      {
        id: 'cap-1',
        name: 'Legacy Application Modernization',
        description: 'Modernization of legacy applications while minimizing business disruption.'
      },
      {
        id: 'cap-2',
        name: 'Cloud Migration Strategy',
        description: 'End-to-end strategy for migrating on-premise infrastructure to public or hybrid clouds.'
      },
      {
        id: 'cap-3',
        name: 'Security & Compliance Audit',
        description: 'Comprehensive review mapped to SOC2, HIPAA, or ISO27001 requirements.'
      }
    ]);
  }),

  http.get(`${API_BASE}/api/v1/knowledge/products*`, async () => {
    if (import.meta.env?.VITE_MOCK_CAPABILITIES === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json([
      {
        id: 'prod-janmasethu',
        name: 'JanmaSethu',
        tagline: 'Bridge to Parenthood — Journey-Aware Healthtech Platform',
        category: 'Healthtech & Maternity',
        description: 'A highly dynamic, ecosystem-driven healthtech platform designed to guide couples through the entire parenthood journey.',
        features: JSON.stringify([
          'Journey-Aware Architecture',
          'Sakhi AI Chat Companion',
          'Bilingual Experience',
          'B2B Clinic Portal'
        ])
      },
      {
        id: 'prod-ottobon-courses',
        name: 'Ottobon Course Platform',
        tagline: "Don't just watch. Build. Structured AI-native learning for practical upskilling",
        category: 'AI-Native EdTech',
        description: 'A structured, AI-native guided upskilling environment inside the Ottobon Academy ecosystem.',
        features: JSON.stringify([
          '4-Stage Learning Framework',
          'AI-Assisted Doubt Clarification',
          'Real-World Sandboxes'
        ])
      }
    ]);
  }),

  // Legacy fallback
  http.get(`${API_BASE}/api/capabilities`, async () => {
    if (import.meta.env?.VITE_MOCK_CAPABILITIES === 'false' || import.meta.env?.VITE_API_MODE !== 'mock') {
      return passthrough();
    }
    await delay(600);
    return HttpResponse.json({
      capabilities: [
        {
          id: 'cap-1',
          name: 'Legacy Application Modernization',
          category: 'SERVICE',
          description: 'Modernization of legacy applications while minimizing business disruption.',
          relevantExpertise: ['Application modernization', 'Cloud migration', 'Architecture', 'DevOps'],
          evidenceSource: 'Internal Services Catalog 2026'
        },
        {
          id: 'cap-2',
          name: 'Cloud Migration Strategy',
          category: 'SERVICE',
          description: 'End-to-end strategy for migrating on-premise infrastructure to public or hybrid clouds.',
          relevantExpertise: ['Cloud Architecture', 'Infrastructure', 'AWS/Azure/GCP'],
          evidenceSource: 'Internal Services Catalog 2026'
        },
        {
          id: 'cap-3',
          name: 'Security & Compliance Audit',
          category: 'SOLUTION',
          description: 'Comprehensive review mapped to SOC2, HIPAA, or ISO27001 requirements.',
          relevantExpertise: ['Cybersecurity', 'Compliance', 'Auditing'],
          evidenceSource: 'Internal Solutions Catalog 2026'
        }
      ]
    });
  }),

  http.get(`${API_BASE}/api/opportunities/:id/capability-matches`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      matches: [
        {
          id: 'match-1',
          opportunityId: params.id,
          capabilityId: 'cap-1',
          capability: {
            id: 'cap-1',
            name: 'Legacy Application Modernization',
            category: 'SERVICE',
            description: 'Modernization of legacy applications while minimizing business disruption.',
            relevantExpertise: ['Application modernization', 'Cloud migration', 'Architecture', 'DevOps'],
            evidenceSource: 'Internal Services Catalog 2026'
          },
          status: 'CANDIDATE',
          reasoning: {
            problemAlignment: 'STRONG',
            requirementAlignment: 'STRONG',
            technologyAlignment: 'STRONG',
            industryAlignment: 'MODERATE',
            overallExplanation: 'Directly addresses the monolith release constraints and satisfies the minimal disruption requirement explicitly cited by the CTO.'
          },
          evidenceIds: ['tc-1'],
          confidence: 92
        },
        {
          id: 'match-2',
          opportunityId: params.id,
          capabilityId: 'cap-3',
          capability: {
            id: 'cap-3',
            name: 'Security & Compliance Audit',
            category: 'SOLUTION',
            description: 'Comprehensive review mapped to SOC2, HIPAA, or ISO27001 requirements.',
            relevantExpertise: ['Cybersecurity', 'Compliance', 'Auditing'],
            evidenceSource: 'Internal Solutions Catalog 2026'
          },
          status: 'CANDIDATE',
          reasoning: {
            problemAlignment: 'WEAK',
            requirementAlignment: 'MODERATE',
            technologyAlignment: 'NONE',
            industryAlignment: 'STRONG',
            overallExplanation: 'While not addressing the legacy monolith directly, SOC2 compliance was mentioned as a prerequisite by the CISO, making this a strong cross-sell opportunity.'
          },
          evidenceIds: ['tc-1'],
          confidence: 65
        }
      ]
    });
  }),

  http.patch(`${API_BASE}/api/opportunities/:oppId/capability-matches/:matchId`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/opportunities/:id/network-matches`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      selectedCapability: {
        id: 'cap-1',
        name: 'Legacy Application Modernization',
        category: 'SERVICE',
        description: 'Modernization of legacy applications while minimizing business disruption.',
        relevantExpertise: ['Application modernization', 'Cloud migration', 'Architecture', 'DevOps'],
        evidenceSource: 'Internal Services Catalog 2026'
      },
      matches: [
        {
          id: 'nmatch-1',
          opportunityId: params.id,
          capabilityId: 'cap-1',
          candidateId: 'u-1',
          candidateName: 'John Smith',
          candidateTitle: 'Internal Architecture Lead',
          candidateCompany: 'NetworkOS',
          matchType: 'INTERNAL',
          status: 'CANDIDATE',
          dimensions: {
            relevance: 'STRONG',
            expertise: 'STRONG',
            relationshipStrength: 'UNKNOWN',
            industryFit: 'STRONG',
            geography: 'MODERATE',
            availability: 'AVAILABLE'
          },
          reasoning: 'Strong legacy modernization expertise aligns directly with the selected capability. John has prior experience with enterprise modernization for similar corporate clients.',
          evidenceIds: ['tc-1'],
          confidence: 90
        },
        {
          id: 'nmatch-2',
          opportunityId: params.id,
          capabilityId: 'cap-1',
          candidateId: 'u-2',
          candidateName: 'Alan Turing',
          candidateTitle: 'External Technology Advisor',
          candidateCompany: 'Turing Advisory',
          matchType: 'NETWORK',
          status: 'CANDIDATE',
          dimensions: {
            relevance: 'MODERATE',
            expertise: 'STRONG',
            relationshipStrength: 'STRONG',
            industryFit: 'MODERATE',
            geography: 'UNKNOWN',
            availability: 'LIMITED'
          },
          reasoning: 'Alan has a strong existing relationship with the founder and deep expertise in enterprise architecture consulting. He can provide external advisory for Cyberdyne\'s monolith scaling issues.',
          evidenceIds: ['tc-1'],
          confidence: 85
        },
        {
          id: 'nmatch-3',
          opportunityId: params.id,
          capabilityId: 'cap-1',
          candidateId: 'hyb-1',
          candidateName: 'Modernization Delivery Team + Alan Turing',
          candidateTitle: 'Hybrid Delivery Squad',
          candidateCompany: 'NetworkOS & Partners',
          matchType: 'HYBRID',
          status: 'CANDIDATE',
          dimensions: {
            relevance: 'STRONG',
            expertise: 'STRONG',
            relationshipStrength: 'MODERATE',
            industryFit: 'STRONG',
            geography: 'UNKNOWN',
            availability: 'UNKNOWN'
          },
          reasoning: 'Combines the internal execution capabilities of the Modernization team with the external strategic trust of Alan Turing.',
          evidenceIds: ['tc-1'],
          confidence: 88
        }
      ]
    });
  }),

  http.patch(`${API_BASE}/api/opportunities/:oppId/network-matches/:matchId`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/opportunities/:id/introduction`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      id: 'intro-1',
      opportunityId: params.id,
      selectedCapabilityId: 'cap-1',
      selectedNetworkMatchId: 'nmatch-2',
      personId: 'p-1',
      companyId: 'c-1',
      trustedContextIds: ['tc-1'],
      context: {
        personName: 'Sarah Connor',
        companyName: 'Cyberdyne Systems',
        opportunityTitle: 'Cyberdyne Legacy Modernization',
        capabilityName: 'Legacy Application Modernization',
        networkMatchName: 'Alan Turing',
        networkMatchCompany: 'Turing Advisory',
        relationshipRole: 'Advisor',
        relationshipStrength: 'STRONG'
      },
      introductionReason: 'Alan has deep enterprise modernization expertise that aligns with Cyberdyne\'s validated requirement. The founder has a strong trusted relationship with Alan, making this introduction contextually appropriate and highly relevant.',
      mutualValue: {
        howTheyHelpUs: 'Alan provides critical enterprise architecture and legacy modernization advisory for Cyberdyne\'s monolith scaling issues.',
        howWeHelpThem: 'Alan gains potential access to a high-profile modernization initiative at Cyberdyne Systems, expanding his advisory footprint.'
      },
      messageDraft: `Hi Sarah,\n\nI wanted to connect you with Alan Turing because of your current focus on Legacy Application Modernization.\n\nAlan has relevant experience in enterprise architecture consulting, which may be useful given your monolith scaling constraints we discussed.\n\nI thought it would be valuable for you both to connect and explore whether there is a fit.\n\nBest,\nFounder`,
      status: 'DRAFT',
      evidenceIds: ['tc-1'],
      confidence: 88,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),

  http.patch(`${API_BASE}/api/opportunities/:oppId/introduction/:introId/draft`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE}/api/opportunities/:oppId/introduction/:introId/status`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/opportunities/:id/post-introduction`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      opportunityId: params.id,
      introductionExecution: {
        id: 'ie-1',
        opportunityId: params.id,
        introductionId: 'intro-1',
        status: 'NOT_MADE',
        evidenceIds: ['tc-1']
      },
      conversations: [],
      outcome: null,
      feedback: null
    });
  }),

  http.patch(`${API_BASE}/api/opportunities/:id/introduction-execution`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.post(`${API_BASE}/api/opportunities/:id/conversations`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE}/api/opportunities/:id/outcome`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.post(`${API_BASE}/api/opportunities/:id/feedback`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/network/matches/:id`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      id: params.id,
      opportunityId: 'opp-1',
      candidateName: 'Alan Turing',
      candidateCompany: 'Bletchley Park Corp',
      matchScore: 88,
      relationshipStrength: 'STRONG',
      capabilityFit: 'HIGH',
      strategicRelevance: 'HIGH',
      reasons: [
        { title: 'Relevant Experience', description: 'Alan Turing consulted for Cyberdyne previously on their initial architecture.', evidenceId: 'ev-2' },
        { title: 'Capability Fit', description: 'Strong overlap with SOC2 requirements and monolith scaling.' }
      ],
      status: 'REVIEW_REQUIRED'
    });
  }),

  http.post(`${API_BASE}/api/network/matches/:id/approval`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/messages/drafts/:id`, async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      id: params.id,
      matchId: 'match-1',
      recipientName: 'Alan Turing',
      subject: 'Introduction: Sarah Connor (Cyberdyne Systems) <> Alan Turing',
      body: 'Hi Alan,\n\nI recently met with Sarah Connor from Cyberdyne Systems. They are looking to scale their legacy monolith and achieve SOC2 compliance. Given your recent work, I thought you two should connect.\n\nBest,\nFounder',
      status: 'DRAFT'
    });
  }),

  http.post(`${API_BASE}/api/messages/approve/:id`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true, status: 'APPROVED_TO_SEND' });
  }),

  // --- Phase 5 Handlers ---
  http.post(`${API_BASE}/api/opportunities/:id/outcome`, async () => {
    await delay(600);
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/network/graph`, async () => {
    await delay(1000);
    return HttpResponse.json({
      nodes: [
        { id: 'n1', label: 'Sarah Connor', type: 'PERSON' },
        { id: 'n2', label: 'Alan Turing', type: 'PERSON' },
        { id: 'n3', label: 'Cyberdyne Systems', type: 'COMPANY' }
      ],
      edges: [
        { source: 'n2', target: 'n3', label: 'Consulted For' },
        { source: 'n1', target: 'n3', label: 'CIO' }
      ]
    });
  }),

  http.get(`${API_BASE}/api/network/events`, async () => {
    await delay(800);
    return HttpResponse.json({
      events: [
        {
          id: 'ev-1',
          title: 'Funding Round Announced',
          description: 'Cyberdyne Systems just raised $50M Series B for cloud modernization.',
          contactId: '99',
          contactName: 'Sarah Connor',
          date: '2026-10-01',
          signalStrength: 'HIGH'
        }
      ]
    });
  }),

  http.get(`${API_BASE}/api/network/insights`, async () => {
    await delay(800);
    return HttpResponse.json({
      insights: [
        {
          id: 'ins-1',
          title: 'Monolith Scaling Trend',
          description: '3 other portfolio companies are explicitly searching for SOC2 compliance infrastructure within 6 months of a Series B.',
          patternStrength: 'STRONG',
          isConfirmed: false,
          relatedNodesCount: 12
        }
      ]
    });
  })
];
