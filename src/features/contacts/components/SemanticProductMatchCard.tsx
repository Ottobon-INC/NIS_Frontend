import React, { useState, useEffect } from 'react';
import { Target, Lightbulb, Wrench, Briefcase } from 'lucide-react';
import { matchingApi } from '../../../services/api/matching.api';
import type { SemanticProductMatchResponse } from '../../../services/api/matching.api';

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  tagline: string;
  icon: string;
  targetAudience: string;
  keyCapability: string;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  rationale: string;
  testPrompt: string;
  actionLabel: string;
}

const getAuthenticCatalog = (company?: string, title?: string): CatalogProduct[] => [
  {
    id: 'prod-sbloom',
    name: 'sBLOOM',
    category: 'Creator Economy & Media Infrastructure',
    tagline: 'Bloom Your Social Footprint — Creator, Content & Digital-Growth Ecosystem',
    icon: '✨',
    targetAudience: 'Digital creators, doctors, specialists, executive coaches, and technical leaders building thought leadership',
    keyCapability: 'Thought leadership personal branding, 8-stage video engine, and LinkedIn authority building',
    statusLabel: 'Creator & Media Studio Only',
    statusColor: '#475569',
    statusBg: '#F1F5F9',
    rationale: `Purpose-built for digital creators, executive coaches, and media leaders building active studio presence, podcast suites, or video production pipelines. Fits only when personal branding, video engines, or digital media authority is an explicit requirement.`,
    testPrompt: `Building verified thought leadership, executive content authority, and video production on LinkedIn for ${title || 'Leader'} at ${company || 'the firm'}.`,
    actionLabel: 'Test Creator / Media Branding Angle'
  },
  {
    id: 'prod-talentops',
    name: 'TalentOps',
    category: 'HR Tech & Workforce Operations',
    tagline: 'AI-Powered Workforce Operations Platform',
    icon: '👥',
    targetAudience: 'High-growth startups, SMEs, and distributed enterprise organizations',
    keyCapability: 'Automated employee onboarding, timesheet consolidation, leave validation, and payroll processing',
    statusLabel: 'Workforce Operations Only',
    statusColor: '#475569',
    statusBg: '#F1F5F9',
    rationale: `Specialized in internal HR and timesheet aggregation. Only fits if the organization is facing internal staffing, contractor management, or payroll friction.`,
    testPrompt: `Operational overhead, manual onboarding friction, and delayed timesheet consolidation for engineering teams at ${company || 'the firm'}.`,
    actionLabel: 'Test TalentOps Workforce Angle'
  },
  {
    id: 'prod-ottobon-courses',
    name: 'Ottobon Course Platform',
    category: 'AI-Native EdTech & Upskilling',
    tagline: 'Don’t just watch. Build. Structured AI-native learning for practical upskilling',
    icon: '🎓',
    targetAudience: 'Software developers, engineering students, technical teams, and coaching certification institutes',
    keyCapability: 'Interactive AI tutor, code sandboxes, assessment checkpoints, and cohort learning management',
    statusLabel: 'EdTech / Upskilling Only',
    statusColor: '#475569',
    statusBg: '#F1F5F9',
    rationale: `Purpose-built for developer education, cohort courses, and technical training. Only fits if the company provides structured courses or upskilling.`,
    testPrompt: `Software developers experience tutorial fatigue, watching endless courses without practical project building or code sandboxes at ${company || 'the firm'}.`,
    actionLabel: 'Test Technical Upskilling Angle'
  },
  {
    id: 'prod-networkos',
    name: 'NetworkOS Platform',
    category: 'Enterprise Relationship OS',
    tagline: 'Commercial Relationship Intelligence Operating System',
    icon: '🌐',
    targetAudience: 'Founders, Managing Partners, Enterprise Business Development Leaders',
    keyCapability: 'Executive relationship capital mapping, autonomous research orchestration, and founder deal flow',
    statusLabel: 'Relationship OS Only',
    statusColor: '#475569',
    statusBg: '#F1F5F9',
    rationale: `Foundational OS for managing executive networks and evidence-backed relationship intelligence. Fits commercial BD teams and managing partners.`,
    testPrompt: `Underutilized executive relationship capital and fragmented manual research on prospective enterprise clients at ${company || 'the firm'}.`,
    actionLabel: 'Test Relationship Intelligence Angle'
  },
  {
    id: 'prod-janmasethu',
    name: 'JanmaSethu',
    category: 'Healthtech & Digital Health Solutions',
    tagline: 'Bridge to Parenthood & Digital Clinic Practice Management',
    icon: '🩺',
    targetAudience: 'Practicing doctors, specialty clinics, hospitals, and patients seeking structured guidance',
    keyCapability: 'Digital patient management, preparedness scoring, Sakhi AI bilingual companion, and clinic intake',
    statusLabel: 'Healthcare Domain Boundary',
    statusColor: '#64748B',
    statusBg: '#F8FAFC',
    rationale: `Exclusive to clinical practices, gastroenterology, fertility, and doctor-patient intake. Strictly out of portfolio for data engineering.`,
    testPrompt: `Specialty clinics wasting clinical consultation hours dealing with unqualified patient inquiries and lacking bilingual intake pipelines.`,
    actionLabel: 'Test Clinic Practice Angle'
  }
];

export const isProblemVerified = (problem?: string | null): boolean => {
  if (!problem || !problem.trim()) return false;
  const p = problem.trim().toLowerCase();
  const unverifiedKeywords = [
    'no verified',
    'unverified',
    'not verified',
    'no explicit problem',
    'no observed problem',
    'pending research',
    'unknown',
    'none',
    'n/a',
    'not specified',
    'no problem',
    'no business problem',
    'not yet verified',
    'to be verified',
    'no identified',
    'not identified',
    'no bounded problem',
    'analyzing dossier',
    'awaiting research',
    'insufficient evidence',
    'conflicting evidence',
    'hypothesis only',
    'unverified hypothesis'
  ];
  if (unverifiedKeywords.some(kw => p.includes(kw))) {
    return false;
  }
  const cleaned = p.replace(/[^a-z0-9]/g, '');
  if (cleaned.length < 4) {
    return false;
  }
  return true;
};

export interface ProposedSolutionDetails {
  overview: string;
  technicalBlueprint: string;
  deliveryModel: string;
  immediateNextStep: string;
}

const getProposedSolutionDetails = (
  problem?: string | null,
  domain?: string | null,
  company?: string | null,
  backendSolution?: string | null
): ProposedSolutionDetails | null => {
  if (!isProblemVerified(problem)) {
    return null;
  }

  if (backendSolution && backendSolution.trim()) {
    return {
      overview: backendSolution,
      technicalBlueprint: backendSolution.includes('(1)') 
        ? backendSolution 
        : `Implement modern architecture, decoupled services, and targeted engineering sprints to resolve ${problem ? problem.toLowerCase() : 'operational'} bottlenecks.`,
      deliveryModel: 'Delivered as an Ottobon Bespoke Engineering Sprint (60 hours, $10,000 indicative sprint).',
      immediateNextStep: 'Conduct architecture & bottleneck audit with the engineering team to map constraints and deliver target blueprint.'
    };
  }

  const pLower = (problem || '').toLowerCase();
  const cName = company || 'the enterprise';

  if (pLower.includes('scale') || pLower.includes('scaling') || pLower.includes('system') || pLower.includes('architecture') || pLower.includes('latency') || pLower.includes('monolith')) {
    return {
      overview: `Architecture Modernization & Distributed Scaling Framework for ${cName}: (1) Profiling & Bottleneck Isolation: Audit distributed traces, slow queries, and database locks under peak load to pinpoint compute/storage bottlenecks. (2) Asynchronous Workload Decoupling: Offload synchronous blocking endpoints via event-driven messaging (Kafka / AWS SQS) and dedicated background worker pools. (3) Data Tier Caching & Sharding: Implement multi-layer caching (Redis) and database read-replicas with connection pooling to eliminate database saturation. (4) Elastic Horizontal Autoscaling: Deploy containerized microservices with Horizontal Pod Autoscaling (Kubernetes / EKS) behind load balancers.`,
      technicalBlueprint: 'Distributed Systems & Decoupled Infrastructure: Event-driven queues (Kafka/SQS) + Multi-tier caching (Redis) + Read-replicas with connection pooling + Kubernetes HPA horizontal scaling.',
      deliveryModel: 'Delivered via Ottobon Bespoke Engineering: 60-hour Architecture Review & Scaling Sprint ($10,000 indicative sprint) as outlined in Commercial Opportunity.',
      immediateNextStep: 'Execute initial diagnostic audit of database locks, query latencies, and service bottlenecks to formulate the 4-week modernization sprint plan.'
    };
  }

  if (pLower.includes('data') || pLower.includes('pipeline') || pLower.includes('etl') || pLower.includes('warehouse')) {
    return {
      overview: `Modern Data Platform & Pipeline Optimization for ${cName}: (1) Transition legacy batch ETL to event-driven streaming pipelines (dbt, Apache Airflow / Dagster). (2) Standardize schema contracts and automated data quality validation checkpoints. (3) Optimize analytical query performance with columnar storage and partitioned warehouses (Snowflake / BigQuery).`,
      technicalBlueprint: 'Modern Data Stack: Streaming ETL pipelines (Airflow/dbt) + Schema contract enforcement + Partitioned columnar lakehouse.',
      deliveryModel: 'Delivered via Ottobon Custom Data Engineering Advisory Sprint.',
      immediateNextStep: 'Map existing ingestion pipelines and data freshness SLAs to establish target pipeline architecture.'
    };
  }

  return {
    overview: `Tailored Solution Architecture Blueprint for ${cName}: (1) Comprehensive Current-State Diagnostic: Evaluate existing systems, operational friction points, and constraint thresholds. (2) Solution Architecture Specification: Formulate a modern, decoupled target architecture with clear ROI milestones. (3) Iterative Delivery Sprint: Execute a focused pilot implementation to resolve the core bottleneck within 4-6 weeks.`,
    technicalBlueprint: `End-to-End Modernization Blueprint: Diagnostic assessment + Target architecture design + Automated workflow implementation tailored to ${domain || 'enterprise operations'}.`,
    deliveryModel: 'Delivered via Ottobon Bespoke Engineering & Advisory Sprint (Custom Delivery Model).',
    immediateNextStep: 'Conduct a 45-minute technical discovery session to review constraints, tech stack, and deliverable scope.'
  };
};

interface SemanticProductMatchCardProps {
  contactId: string;
  contactName?: string;
  contactCompany?: string;
  contactTitle?: string;
  defaultProblem?: string;
  onMatchResult?: (res: SemanticProductMatchResponse | null) => void;
}

export const SemanticProductMatchCard: React.FC<SemanticProductMatchCardProps> = ({
  contactId,
  contactName,
  contactCompany,
  contactTitle,
  defaultProblem = '',
  onMatchResult
}) => {
  const [problemText, setProblemText] = useState(defaultProblem);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<SemanticProductMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCatalogExplorer, setShowCatalogExplorer] = useState(false);

  const authenticCatalog = getAuthenticCatalog(contactCompany, contactTitle);

  const handleTestAngle = (testPrompt: string) => {
    setIsCustomMode(true);
    setProblemText(testPrompt);
    runMatching(testPrompt, true);
  };

  // Update local problem when defaultProblem changes
  useEffect(() => {
    if (defaultProblem && !isCustomMode && !problemText && !matchResult) {
      setProblemText(defaultProblem);
    }
  }, [defaultProblem, isCustomMode, matchResult]);

  const runMatching = async (textToMatch?: string, overrideCustomMode?: boolean) => {
    const customModeActive = overrideCustomMode !== undefined ? overrideCustomMode : isCustomMode;
    const text = textToMatch !== undefined ? textToMatch : problemText;
    setIsLoading(true);
    setError(null);
    try {
      if (text && text.trim() && customModeActive) {
        const res = await matchingApi.semanticMatchProblem(text.trim(), {
          connection_id: contactId,
          connection_name: contactName,
          connection_company: contactCompany,
          connection_title: contactTitle
        });
        setMatchResult(res);
        onMatchResult?.(res);
      } else {
        const res = await matchingApi.semanticMatchConnection(contactId);
        setMatchResult(res);
        onMatchResult?.(res);
        if (res.identified_problem) {
          setProblemText(res.identified_problem);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete semantic product matching.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (contactId) {
      runMatching();
    }
  }, [contactId]);

  const outcome = matchResult?.matching_outcome || 'NO_MATCH_FOUND';

  // Visual style tokens based on outcome
  const hasVerifiedProblem = isProblemVerified(problemText || matchResult?.identified_problem);

  const getOutcomeTheme = () => {
    if (!matchResult) {
      return {
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: '#475569',
        badgeBg: '#F1F5F9',
        badgeText: '#475569',
        icon: '⏳',
        label: 'AWAITING EVALUATION'
      };
    }

    if (!hasVerifiedProblem) {
      return {
        bg: '#F8FAFC',
        border: '#CBD5E1',
        text: '#475569',
        badgeBg: '#F1F5F9',
        badgeText: '#475569',
        icon: '🔒',
        label: 'PROBLEM UNVERIFIED'
      };
    }

    switch (outcome) {
      case 'MATCH_FOUND':
        return {
          bg: '#F0FDF4',
          border: '#86EFAC',
          text: '#15803D',
          badgeBg: '#DCFCE7',
          badgeText: '#166534',
          icon: '✓',
          label: 'MATCH FOUND'
        };
      case 'INSUFFICIENT_INFORMATION':
        return {
          bg: '#EEF2FF',
          border: '#C7D2FE',
          text: '#4338CA',
          badgeBg: '#E0E7FF',
          badgeText: '#3730A3',
          icon: 'ℹ',
          label: 'INSUFFICIENT INFORMATION'
        };
      case 'NEEDS_VALIDATION':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          badgeBg: '#FEF3C7',
          badgeText: '#92400E',
          icon: '⚡',
          label: 'NEEDS VALIDATION'
        };
      case 'NO_MATCH_FOUND':
      default:
        return {
          bg: '#F8FAFC',
          border: '#CBD5E1',
          text: '#475569',
          badgeBg: '#F1F5F9',
          badgeText: '#334155',
          icon: '✕',
          label: 'NO PRODUCT FIT'
        };
    }
  };

  const theme = getOutcomeTheme();

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Target size={18} color="#2563EB" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              Observed Problem & Internal Product Fit
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#F1F5F9',
              color: '#475569',
              letterSpacing: '0.04em'
            }}>
              INTERNAL PRODUCTS ONLY
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Evaluates the problem observed in the profile dossier against our internal products.
          </p>
        </div>

        {/* Status Badge */}
        {matchResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            background: theme.badgeBg,
            border: `1px solid ${theme.border}`,
            color: theme.badgeText,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.02em'
          }}>
            <span>{theme.icon}</span>
            <span>{!hasVerifiedProblem ? 'Problem Unverified' : (matchResult.suggested_status || theme.label)}</span>
          </div>
        )}
      </div>

      {/* Problem Input / Custom Query Box */}
      <div style={{
        padding: 'var(--space-4)',
        background: '#F8FAFC',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Connection Problem Statement
          </span>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4F46E5',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isCustomMode ? '← Use Dossier Identified Problem' : '✏ Edit / Test Custom Problem'}
          </button>
        </div>

        {isCustomMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Enter specific operational problem or business bottleneck..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => runMatching(problemText, true)}
                disabled={isLoading || !problemText.trim()}
                style={{
                  padding: '6px 14px',
                  background: '#4F46E5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Evaluating...' : 'Re-evaluate Capability Fit'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            fontSize: '13px',
            color: '#1E293B',
            lineHeight: 1.5,
            fontStyle: problemText ? 'normal' : 'italic'
          }}>
            &ldquo;{problemText || 'Analyzing dossier to extract smallest solvable problem...'}&rdquo;
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '13px',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-sm)'
        }}>
          Evaluating problem against internal product capabilities...
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-sm)',
          color: '#991B1B',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {/* Match Result Body */}
      {matchResult && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Domain Classification Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#F1F5F9',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: '#334155'
          }}>
            <div>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Identified Business Domain: </span>
              <strong style={{ color: '#0F172A' }}>{matchResult.problem_domain}</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Catalog Bounds: 5 Authentic Internal Products
            </span>
          </div>

          {/* Rationale Callout */}
          <div style={{
            padding: 'var(--space-4)',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            color: theme.text,
            lineHeight: 1.5
          }}>
            <strong>Evaluation Summary: </strong>
            {!hasVerifiedProblem
              ? 'No verified operational problem or business bottleneck has been identified for this contact. Product capability matching and solution recommendations require an authentic, verified operational problem.'
              : matchResult.rationale}
          </div>

          {/* 1. NO MATCH FOUND: Show explicit capability gap */}
          {outcome === 'NO_MATCH_FOUND' && matchResult.capability_gap && (
            <div style={{
              padding: 'var(--space-4)',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: '#475569'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '4px' }}>
                Catalog Boundary Gap:
              </div>
              <div>{matchResult.capability_gap}</div>
            </div>
          )}

          {/* WHAT CAN BE THE SOLUTION - SHOWN ONLY IF PROBLEM IS VERIFIED AND NO PRODUCTS MATCH */}
          {(!matchResult.matches || matchResult.matches.length === 0) && (() => {
            if (!hasVerifiedProblem) {
              return (
                <div style={{
                  padding: '16px',
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '22px' }}>🔒</span>
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    <strong style={{ color: '#1E293B' }}>Problem Not Verified — No Solution Suggested: </strong>
                    An authentic, verified operational problem has not been identified for this contact yet. Solutions are only suggested once a verified operational problem or friction point is confirmed through research or discovery.
                  </div>
                </div>
              );
            }

            const solutionDetails = getProposedSolutionDetails(
              problemText || matchResult.identified_problem,
              matchResult.problem_domain,
              matchResult.connection_company,
              matchResult.proposed_solution
            );

            if (!solutionDetails) {
              return null;
            }

            return (
              <div style={{
                marginTop: '4px',
                padding: '16px',
                background: 'linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 100%)',
                border: '1.5px solid #93C5FD',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(37,99,235,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={18} color="#2563EB" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1E3A8A' }}>
                      What Can Be The Solution For This Problem:
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#DBEAFE',
                    color: '#1D4ED8',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.02em'
                  }}>
                    Custom Solution & Advisory Blueprint
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: 1.6, background: '#FFFFFF', padding: '12px 14px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                  <strong style={{ color: '#1E40AF' }}>Recommended Strategy: </strong>
                  {solutionDetails.overview}
                </div>

                {/* 3 Pillars: Technical Blueprint, Delivery Model, Next Step */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '10px'
                }}>
                  <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Wrench size={12} />
                      <span>1. Technical Solution Blueprint</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {solutionDetails.technicalBlueprint}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Briefcase size={12} />
                      <span>2. Delivery & Commercial Model</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {solutionDetails.deliveryModel}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Target size={12} />
                      <span>3. Immediate Action Plan</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {solutionDetails.immediateNextStep}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. INSUFFICIENT_INFORMATION or NEEDS_VALIDATION: Missing Info & Validation Questions */}
          {(outcome === 'INSUFFICIENT_INFORMATION' || outcome === 'NEEDS_VALIDATION') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {/* Missing Details */}
              {matchResult.missing_information && matchResult.missing_information.length > 0 && (
                <div style={{
                  padding: 'var(--space-4)',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Missing Operational Information:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.missing_information.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Questions */}
              {matchResult.validation_questions && matchResult.validation_questions.length > 0 && (
                <div style={{
                  padding: 'var(--space-4)',
                  background: '#FFFBEB',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #FDE68A'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400E', marginBottom: '6px' }}>
                    Questions to Confirm Before Recommendation:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#78350F', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.validation_questions.map((q, idx) => (
                      <li key={idx}>&ldquo;{q}&rdquo;</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 3. MATCH_FOUND / MATCHED PRODUCTS DISPLAY */}
          {matchResult.matches && matchResult.matches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {matchResult.matches.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-5)',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Product Title Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                          {item.product_name}
                        </h4>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#EEF2FF',
                          color: '#4F46E5'
                        }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                        {item.tagline}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#DCFCE7',
                        color: '#15803D'
                      }}>
                        {item.match_score}% Match
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#334155'
                      }}>
                        {item.alignment_level} FIT
                      </span>
                    </div>
                  </div>

                  {/* Why this product solves it */}
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid #10B981',
                    fontSize: '13px',
                    color: '#1E293B',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: '#0F766E' }}>Why it solves the problem: </strong>
                    {item.why_this_product_solves_it}
                  </div>

                  {/* Relevant features */}
                  {item.relevant_features && item.relevant_features.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '6px' }}>
                        Mapped Product Capabilities:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.relevant_features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              fontSize: '12px',
                              background: '#F1F5F9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assumptions / Prerequisites if any */}
                  {item.assumptions_or_prerequisites && item.assumptions_or_prerequisites.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      <strong style={{ color: '#475569' }}>Prerequisites: </strong>
                      {item.assumptions_or_prerequisites.join(' ')}
                    </div>
                  )}

                  {/* Target Audience & Suggested Step */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {item.target_audience_fit}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5' }}>
                      Next: {item.suggested_first_step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. WHEN NO DIRECT PRODUCT MATCHES IDENTIFIED */}
          {(!matchResult.matches || matchResult.matches.length === 0) && (
            <div style={{
              border: outcome === 'INSUFFICIENT_INFORMATION' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-5)',
              background: outcome === 'INSUFFICIENT_INFORMATION' ? '#F0F7FF' : '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {outcome === 'INSUFFICIENT_INFORMATION' ? 'ℹ️' : '🛡️'}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: outcome === 'INSUFFICIENT_INFORMATION' ? '#1E40AF' : '#334155' }}>
                    {outcome === 'INSUFFICIENT_INFORMATION'
                      ? 'Discovery Required: Operational Bottleneck Unverified'
                      : 'No Matching Product in Portfolio'}
                  </h4>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  background: outcome === 'INSUFFICIENT_INFORMATION' ? '#DBEAFE' : '#F1F5F9',
                  color: outcome === 'INSUFFICIENT_INFORMATION' ? '#1E40AF' : '#475569',
                  border: outcome === 'INSUFFICIENT_INFORMATION' ? '1px solid #BFDBFE' : '1px solid #CBD5E1'
                }}>
                  {outcome === 'INSUFFICIENT_INFORMATION' ? 'Awaiting Discovery' : 'Domain Out of Scope'}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: outcome === 'INSUFFICIENT_INFORMATION' ? '#1E3A8A' : '#64748B', lineHeight: 1.5 }}>
                {outcome === 'INSUFFICIENT_INFORMATION'
                  ? 'Specific operational bottlenecks have not yet been uncovered for this profile. Once specific workflow friction is confirmed during discovery, re-run matching to evaluate against our 5 products.'
                  : 'Evaluated connection problem against our 5 internal products (TalentOps, Ottobon Course Platform, sBLOOM, JanmaSethu, NetworkOS Platform). None achieved commercial capability alignment.'}
              </p>

              {/* Collapsible Portfolio Explorer to manually test hypotheses */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowCatalogExplorer(!showCatalogExplorer)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4F46E5',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{showCatalogExplorer ? '▼' : '►'}</span>
                  <span>{showCatalogExplorer ? 'Hide Portfolio Products' : 'Explore Portfolio Products (5) & Test Angles Manually'}</span>
                </button>

                {showCatalogExplorer && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {authenticCatalog.map((prod) => (
                      <div
                        key={prod.id}
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 14px',
                          background: '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>{prod.icon}</span>
                            <strong style={{ fontSize: '14px', color: '#0F172A' }}>{prod.name}</strong>
                            <span style={{ fontSize: '11px', color: '#4F46E5', background: '#EEF2FF', padding: '1px 6px', borderRadius: '4px' }}>
                              {prod.category}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: prod.statusColor, background: prod.statusBg, padding: '2px 8px', borderRadius: '4px' }}>
                            {prod.statusLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                          {prod.rationale}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            <strong>Capability:</strong> {prod.keyCapability}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTestAngle(prod.testPrompt)}
                            disabled={isLoading}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '4px',
                              background: '#F1F5F9',
                              color: '#4338CA',
                              border: '1px solid #C7D2FE',
                              cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ⚡ {prod.actionLabel}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RECOMMENDED NEXT STEP */}
          {matchResult.recommended_next_step && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-sm)'
            }}>
              <span style={{ fontSize: '14px', color: '#4F46E5' }}>➔</span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: '2px' }}>
                  Recommended Action:
                </span>
                <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500 }}>
                  {matchResult.recommended_next_step}
                </span>
              </div>
            </div>
          )}

          {/* HUMAN-IN-THE-LOOP & FOUNDER APPROVAL CONTROLS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: '#64748B'
          }}>
            <span style={{ fontSize: '14px' }}>🛡</span>
            <span>
              <strong>Founder Control Active:</strong> All capability evaluations and next steps remain strictly advisory pending founder review. Autonomous outreach or commercial commitments are disabled.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
