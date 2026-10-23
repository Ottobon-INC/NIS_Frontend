import { apiClient } from './core/client';

export interface ContactOverview {
  id: string;
  name: string;
  title: string;
  company: string;
  status: 'READY' | 'NEW' | 'RESEARCHING' | 'PROCESSING' | 'IDENTIFIED' | 'INTELLIGENCE_READY' | string;
  lastUpdated: string;
  contact_type?: 'TARGET' | 'BHANU_CONNECTION' | string;
  card_status?: string;
  founder_reviewed?: boolean;
}

export interface IdentifyData {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  confidence: number;
  evidenceId?: string;
  level: 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED' | 'FACT';
}

export interface ProviderTaskSummary {
  task_id: string;
  source_id: string;
  source_name: string;
  status: string;
  target_query?: string;
  error?: string;
  started_at?: string;
  completed_at?: string;
}

export interface ResearchJobStatus {
  job_id: string;
  contact_id?: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  records_discovered: number;
  active_providers: string[];
  completed_providers: string[];
  failed_providers: { provider: string; error: string }[];
  tasks: ProviderTaskSummary[];
}

export interface SourceItem {
  source_id: string;
  source_name: string;
  status: string;
  query?: string;
  reference?: string;
  records_count: number;
  snippet?: string;
  retrieved_at?: string;
  identity_match_status?: string;
  identity_match_confidence?: number;
}

export interface EvidenceClaim {
  id: string;
  claim: string;
  evidence_type: string;
  source_id: string;
  source_reference?: string;
  confidence: number;
  retrieved_date?: string;
}

export interface ResearchJobReport {
  job_id: string;
  contact_id: string;
  name: string;
  title: string;
  company: string;
  full_markdown_report: string;
  commercial_intelligence?: any;
  evidence: EvidenceClaim[];
  sources_used: { source_id: string; reference: string; status: string }[];
  pipeline_stage: string;
}

export interface Contact360Data {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  tier: string;
  card_status?: string;
  founder_reviewed?: boolean;
  contact_type?: string;
  relationshipStrength?: string;
  primaryRole?: string;
  recentSignal?: string;
  personIntelligence: {
    background: string;
    expertise: string[];
    decisionInfluence: string;
  };
  companyIntelligence: {
    industry: string;
    context: string;
    growthSignals: string;
  };
  signals: Signal[];
  howTheyHelpUs: {
    role: string;
    reasoning: string;
    level: 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED';
  }[];
  howWeHelpThem: {
    need: string;
    capability: string;
    level: 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED';
  }[];
  relationship: {
    strength: string;
    type: string;
    previousInteractions: number;
    notes: string;
  };
  currentContext: {
    recentMeetings: string[];
    activeOpportunities: string[];
  };
  // Cumulative Intelligence
  currentTrustedContext?: string[];
  whatWeKnewBefore?: {
    personBackground: string;
    companyContext: string;
  };
  whatWeLearned?: {
    insights: string[];
    rawInputs: {
      id: string;
      sourceType: string;
      content: string;
      date: string;
    }[];
  };
  intelligenceHistory?: {
    id: string;
    content: string;
    sourceType: 'EXTERNAL_RESEARCH' | 'FOUNDER_CONVERSATION' | 'MEETING' | 'FOUNDER_NOTE' | 'SYSTEM_SIGNAL';
    timestamp: string;
  }[];
  evidenceList?: {
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }[];
  
  // Commercial Intelligence Fields
  full_markdown_report?: string;
  epistemicVerification?: {
    identityStatus: string;
    identityConfidence: number;
    verifiedFactsCount: number;
    signalsCount: number;
    hypothesesCount: number;
    quarantinedCount: number;
  };
  commercialIntelligence?: {
    provenanceStatus: string;
    identityResolutionStatus?: string;
    verifiedFacts?: EpistemicFactItem[];
    signalsContext?: EpistemicSignalItem[];
    commercialHypotheses?: EpistemicHypothesisItem[];
    conflictsAndQuarantined?: EpistemicQuarantinedItem[];
    auditIssues?: Array<{
      claim_id?: string;
      issue_type: string;
      message: string;
      severity: string;
    }>;
    domainName: string;
    provenDomainExpertise: string;
    isDomainSme: string;
    opportunityCategory: string;
    broadBusinessProblem: string;
    smallestSolvableProblem: string;
    whyNow: string;
    ottobonCapabilityMatch: string;
    deliveryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    estimatedEffortHours: string;
    costPricingEstimate: string;
    proposedFirstEngagement: string;
    relationshipPath: string;
    pipelineStage: string;
    nextActionStep: string;
    opportunityValidation?: OpportunityValidationData;
    sourcesUsed?: {
      source_id: string;
      reference: string;
      status: string;
    }[];
    evidenceMap?: Record<string, {
      evidence_id?: string;
      id?: string;
      source_result_id?: string;
      source_id: string;
      source_reference?: string;
      claim: string;
      confidence: number;
      evidence_type: string;
      observed_date?: string | null;
      retrieved_date?: string | null;
      identity_match_status?: string | null;
      identity_confidence?: number | null;
      excerpt?: string | null;
    }>;
  };
}

export interface EpistemicFactItem {
  claimId?: string;
  predicate?: string;
  claim: string;
  status: 'VERIFIED' | 'PARTIALLY_SUPPORTED' | string;
  authorityTier?: string;
  sourceUrl?: string;
  quote?: string;
  identityStatus?: string;
}

export interface EpistemicSignalItem {
  claimId?: string;
  predicate?: string;
  claim: string;
  status: 'PARTIALLY_SUPPORTED' | string;
  authorityTier?: string;
  sourceUrl?: string;
  quote?: string;
  observedDate?: string | null;
  identityStatus?: string;
}

export interface EpistemicHypothesisItem {
  hypothesis_id?: string;
  trigger_claim_ids?: string[];
  inferred_pain_point?: string;
  ottobon_capability_offering?: string;
  delivery_risk_assessment?: string;
  estimated_effort_hours?: string;
  pricing_scenario?: string;
  epistemic_status?: string;
}

export interface EpistemicQuarantinedItem {
  claimId?: string;
  issueType?: string;
  reason: string;
  severity?: 'FATAL' | 'WARNING' | string;
  status: 'QUARANTINED' | 'CONFLICTING' | string;
}

export interface OpportunityValidationData {
  status: 'HYPOTHESIS' | 'PROPOSED' | 'VALIDATED' | 'REJECTED' | 'ON_HOLD' | 'PROPOSED_INTERNALLY' | 'UNCERTAIN_IDENTITY' | string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  canValidate?: boolean;
  identityGatePassed?: boolean;
  identityConfidence?: number;
  identityGateReason?: string | null;
  businessProblem?: string;
  capabilityMatch?: string;
  supportingEvidenceIds?: string[];
  assumptions?: string[];
  missingInformation?: string[];
  observedFacts?: string[];
  inferredPainPoints?: string[];
}


export interface EvidenceDetail {
  id: string;
  contact_id: string;
  claim: string;
  evidence_type: 'FACT' | 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | string;
  confidence: number;
  identity_match_status?: 'CONFIRMED' | 'PROBABLE' | 'UNCERTAIN' | string | null;
  identity_match_confidence?: number | null;
  identity_match_rationale?: string | null;
  source_id: string;
  source_name: string;
  source_url?: string | null;
  source_result_id?: string | null;
  excerpt?: string | null;
  publication_date?: string | null;
  retrieved_date?: string | null;
}

export const contactsApi = {
  list: () => apiClient.get<ContactOverview[]>('/api/v1/contacts'),
  triggerResearch: (contactId: string) => 
    apiClient.post<{ job_id: string; contact_id: string; status: string }>(`/api/v1/research/jobs/contact/${contactId}`, {}),
  
  // Legacy create & research
  create: async (data: { linkedinUrl: string }) => {
    const res = await apiClient.post<{ job_id: string; contact_id: string; status: string }>(
      '/api/v1/research/jobs',
      { linkedin_url: data.linkedinUrl }
    );
    return { id: res.job_id, contact_id: res.contact_id, status: res.status };
  },

  getStatus: async (jobId: string) => {
    return apiClient.get<ResearchJobStatus>(`/api/v1/research/jobs/${jobId}`);
  },

  getSources: async (jobId: string) => {
    return apiClient.get<{ job_id: string; total_sources: number; sources: SourceItem[] }>(
      `/api/v1/research/jobs/${jobId}/sources`
    );
  },

  getReport: async (jobId: string) => {
    return apiClient.get<ResearchJobReport>(`/api/v1/research/jobs/${jobId}/report`);
  },

  retryJob: async (jobId: string) => {
    return apiClient.post<{ success: boolean; retried_count: number }>(
      `/api/v1/research/jobs/${jobId}/retry`,
      {}
    );
  },
  
  getIdentify: (id: string) => apiClient.get<IdentifyData>(`/api/v1/contacts/${id}/identify`),
  
  confirmIdentify: async (id: string) => {
    return apiClient.patch(`/api/v1/contacts/${id}/identify`, { status: 'CONFIRMED' });
  },

  get360: (id: string) => apiClient.get<Contact360Data>(`/api/v1/contacts/${id}/360`),

  validateOpportunity: async (id: string, status: string, reviewNotes?: string) => {
    return apiClient.post<OpportunityValidationData>(`/api/v1/contacts/${id}/opportunity/validate`, {
      status,
      review_notes: reviewNotes,
    });
  },

  getEvidence: (contactId: string, evidenceId: string) => {
    if (contactId) {
      return apiClient.get<EvidenceDetail>(`/api/v1/contacts/${contactId}/evidence/${evidenceId}`);
    }
    return apiClient.get<EvidenceDetail>(`/api/v1/contacts/evidence/${evidenceId}`);
  },

  getEvidenceDirect: (evidenceId: string) => {
    return apiClient.get<EvidenceDetail>(`/api/v1/contacts/evidence/${evidenceId}`);
  },

  delete: (id: string) => apiClient.delete<{ success: boolean; deleted_id?: string }>(`/api/v1/contacts/${id}`),

  getCompanyIntelligence: (contactId: string) => 
    apiClient.get<CompanyIntelligenceData>(`/api/v1/contacts/${contactId}/company-intelligence`),
    
  extractCompanyIntelligence: (contactId: string, companyName?: string) => 
    apiClient.post<CompanyIntelligenceData>(`/api/v1/contacts/${contactId}/company-intelligence`, { company_name: companyName }),

  acceptContact: (id: string) =>
    apiClient.post<{ success: boolean; contact_id: string; founder_reviewed: boolean }>(`/api/v1/contacts/${id}/accept`, {}),

  declineContact: (id: string) =>
    apiClient.post<{ success: boolean; contact_id: string }>(`/api/v1/contacts/${id}/decline`, {}),
};

export interface CompanyIntelligenceData {
  id: string;
  contact_id?: string;
  company_name: string;
  website?: string;
  industry?: string;
  overview?: string;
  what_they_implemented?: string;
  is_hiring: boolean;
  hiring_status: 'ACTIVELY_HIRING' | 'MODERATE' | 'LOW_OR_NONE' | 'UNKNOWN' | string;
  hiring_roles?: string[];
  technologies_used?: string[];
  key_initiatives?: string[];
  summary_markdown?: string;
  sources?: { title: string; url: string; snippet?: string }[];
  created_at?: string;
  updated_at?: string;
}

