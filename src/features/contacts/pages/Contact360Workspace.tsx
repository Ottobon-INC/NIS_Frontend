import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import {
  User,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Target,
  Search,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';

import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContact360 } from '../../../hooks/useContact360';
import { useUIStore } from '../../../store/uiStore';
import { contactsApi } from '../../../services/api/contacts.api';
import { CompanyIntelligenceCard } from '../components/CompanyIntelligenceCard';
import { SemanticProductMatchCard } from '../components/SemanticProductMatchCard';
import { matchingApi, type SemanticProductMatchResponse } from '../../../services/api/matching.api';

type TabKey = 'overview' | 'commercial' | 'evidence';

export const Contact360Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openEvidenceDrawer } = useUIStore();
  const { data: contact, isLoading, isError } = useContact360(id || '');

  // Tab State
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showFullReport, setShowFullReport] = useState(false);
  const [productMatch, setProductMatch] = useState<SemanticProductMatchResponse | null>(null);

  // Action States
  const [isDeleting, setIsDeleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');

  const handleValidateAction = (status: string) => {
    setTargetStatus(status);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const submitValidation = async () => {
    if (!id || !targetStatus) return;
    try {
      setIsValidating(true);
      await contactsApi.validateOpportunity(id, targetStatus, reviewNotes);
      await queryClient.invalidateQueries({ queryKey: ['contact360', id] });
      setShowReviewModal(false);
    } catch (err: any) {
      alert(`Validation error: ${err.response?.data?.detail || err.message || 'Action failed'}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptContact = async () => {
    if (!id || !contact) return;
    try {
      setIsAccepting(true);
      await contactsApi.acceptContact(id);
      await queryClient.invalidateQueries({ queryKey: ['contact360', id] });
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
    } catch (err: any) {
      alert(`Failed to accept contact: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineContact = async () => {
    if (!id || !contact) return;
    if (window.confirm(`Decline and archive "${contact.name}"? They will not appear in People & Relationships.`)) {
      try {
        setIsDeclining(true);
        await contactsApi.declineContact(id);
        await queryClient.invalidateQueries({ queryKey: ['contacts'] });
        navigate('/people');
      } catch (err: any) {
        alert(`Failed to decline contact: ${err.message || 'Unknown error'}`);
        setIsDeclining(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!id || !contact) return;
    if (window.confirm(`Are you sure you want to delete "${contact.name}"? This action cannot be undone.`)) {
      try {
        setIsDeleting(true);
        await contactsApi.delete(id);
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        navigate('/people');
      } catch (err: any) {
        alert(`Failed to delete contact: ${err.message || 'Unknown error'}`);
        setIsDeleting(false);
      }
    }
  };

  const formatProductMatchMarkdown = (match: SemanticProductMatchResponse): string => {
    const parts: string[] = [];
    parts.push('\n## 🎯 Internal Product Fit & Catalog Solutions');
    parts.push('*Evaluates the connection\'s operational problem against Ottobon\'s authentic internal software products.*\n');
    parts.push(`- **Identified Connection Problem**: ${match.identified_problem || 'Unknown'}`);
    parts.push(`- **Evaluated Business Domain**: ${match.problem_domain || 'General Operations'}`);
    parts.push(`- **Catalog Matching Outcome**: \`${match.matching_outcome}\` (${match.suggested_status})`);
    if (match.rationale) {
      parts.push(`- **Evaluation Summary**: ${match.rationale}\n`);
    }

    if (match.matches && match.matches.length > 0) {
      parts.push('### Matched Products:');
      parts.push('| Product | Category | Match Score | Alignment | Addressed Problem |');
      parts.push('|---|---|---|---|---|');
      match.matches.forEach(m => {
        parts.push(`| **${m.product_name}** | ${m.category} | ${m.match_score}% | ${m.alignment_level} | ${m.addressed_problem.replace(/\|/g, '-')} |`);
      });
      parts.push('');

      match.matches.forEach(m => {
        parts.push(`#### 📦 ${m.product_name} (Match Score: ${m.match_score}%)`);
        if (m.tagline) parts.push(`- **Tagline**: ${m.tagline}`);
        if (m.why_this_product_solves_it) parts.push(`- **Why This Product Solves It**: ${m.why_this_product_solves_it}`);
        if (m.relevant_features && m.relevant_features.length > 0) {
          parts.push(`- **Key Capabilities & Features**:`);
          m.relevant_features.forEach(f => parts.push(`  - ${f}`));
        }
        if (m.target_audience_fit) parts.push(`- **Target Audience Fit**: ${m.target_audience_fit}`);
        if (m.suggested_first_step) parts.push(`- **Suggested First Step**: ${m.suggested_first_step}\n`);
      });
    } else {
      parts.push('> ℹ️ **No direct product match found in catalog**: The connection\'s problem statement does not currently map to our internal products.\n');
    }

    if (match.validation_questions && match.validation_questions.length > 0) {
      parts.push('### Questions to Confirm Before Recommendation:');
      match.validation_questions.forEach(q => parts.push(`- "${q}"`));
      parts.push('');
    }

    if (match.recommended_next_step) {
      parts.push(`**Recommended Action**: ${match.recommended_next_step}\n`);
    }

    return parts.join('\n');
  };

  const injectProductMatchIntoReport = (rawReport: string, match: SemanticProductMatchResponse | null): string => {
    if (!match || !rawReport) return rawReport;
    const matchSection = formatProductMatchMarkdown(match);
    if (rawReport.includes('## 5. Tentative Proposal')) {
      return rawReport.replace('## 5. Tentative Proposal', `${matchSection}\n\n## 5. Tentative Proposal`);
    } else if (rawReport.includes('## 6. Information Sources')) {
      return rawReport.replace('## 6. Information Sources', `${matchSection}\n\n## 6. Information Sources`);
    } else {
      return `${rawReport}\n\n${matchSection}`;
    }
  };

  const handleDownloadReport = async () => {
    if (!contact?.full_markdown_report) {
      alert('No intelligence report is available to download.');
      return;
    }

    let matchData = productMatch;
    if (!matchData && id) {
      try {
        matchData = await matchingApi.semanticMatchConnection(id);
        if (matchData) {
          setProductMatch(matchData);
        }
      } catch (e) {
        console.warn('Could not fetch product matching for report download:', e);
      }
    }

    const reportWithProducts = injectProductMatchIntoReport(contact.full_markdown_report, matchData);
    const safeName = (contact.name || 'contact').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const blob = new Blob([reportWithProducts], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${safeName}_intelligence_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportContent = contact?.full_markdown_report;
  const processedReport = useMemo(() => {
    if (!reportContent) return '';
    const enriched = injectProductMatchIntoReport(reportContent, productMatch);
    return enriched.replace(/(?<!\[)\[(E\d+)\](?!\()/g, '[$1](#evidence-$1)');
  }, [reportContent, productMatch]);

  if (!id) return <div>Invalid Contact ID</div>;

  const isGatePassed = contact?.commercialIntelligence?.opportunityValidation?.identityGatePassed ?? true;
  const identityConfidence = contact?.commercialIntelligence?.opportunityValidation?.identityConfidence ?? 100;
  const identityGateReason = contact?.commercialIntelligence?.opportunityValidation?.identityGateReason;
  const pipelineStage = contact?.commercialIntelligence?.pipelineStage || 'PROPOSED';
  const sourcesCount = contact?.commercialIntelligence?.sourcesUsed?.length ?? 0;

  const verifiedFacts = contact?.commercialIntelligence?.verifiedFacts || [];
  const signalsContext = contact?.commercialIntelligence?.signalsContext || [];
  const commercialHypotheses = contact?.commercialIntelligence?.commercialHypotheses || [];
  const conflictsQuarantined = contact?.commercialIntelligence?.conflictsAndQuarantined || [];
  const identityResStatus = contact?.commercialIntelligence?.identityResolutionStatus || (isGatePassed ? 'CONFIRMED' : 'AMBIGUOUS');

  const isPlaceholderValue = (val?: string | null) => {
    if (!val) return true;
    const clean = val.trim().toLowerCase();
    const placeholders = [
      '[unverified]',
      'unverified',
      'unknown',
      'pending research',
      'none',
      'n/a',
      'na',
      'unspecified',
      'not specified',
      'not provided',
      'tbd',
      'null',
      'undefined'
    ];
    return placeholders.includes(clean);
  };

  return (
    <WorkspaceShell
      title={contact ? contact.name : 'Loading Contact...'}
      subtitle={
        contact
          ? `${contact.title || 'Executive'}${
              !isPlaceholderValue(contact.company) ? ` · ${contact.company}` : ''
            }`
          : ''
      }
      breadcrumbs={[
        { label: 'People', path: '/people' },
        { label: contact?.name || 'Contact 360', path: `/people/${id}` }
      ]}
      primaryAction={{
        label: 'Prepare Meeting',
        onClick: () => navigate(`/meetings/${id}/brief`)
      }}
      secondaryActions={[
        ...(!contact?.founder_reviewed
          ? [
              {
                label: isAccepting ? 'Accepting...' : '✓ Accept Profile',
                onClick: handleAcceptContact,
                variant: 'primary' as const,
                disabled: isAccepting
              }
            ]
          : []),
        ...(contact?.full_markdown_report
          ? [
              {
                label: 'Download Report',
                onClick: handleDownloadReport,
                variant: 'primary' as const
              }
            ]
          : []),
        {
          label: isDeleting ? 'Deleting...' : 'Delete Contact',
          onClick: handleDelete,
          variant: 'danger',
          disabled: isDeleting
        }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={false}
    >
      {contact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* 1. Pending Acceptance Banner (if not yet reviewed) */}
          {!contact.founder_reviewed ? (
            <div
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '1px solid #FCD34D',
                borderRadius: '12px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 2px 5px rgba(217, 119, 6, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>⏳</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                    Candidate Profile Pending Review
                  </div>
                  <div style={{ fontSize: '12px', color: '#B45309' }}>
                    Accept this contact to officially track and activate them in your <strong>People & Relationships</strong> network.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAcceptContact}
                  disabled={isAccepting}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#2563EB',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: isAccepting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
                  }}
                >
                  {isAccepting ? 'Accepting…' : '✓ Accept Contact'}
                </button>
                <button
                  type="button"
                  onClick={handleDeclineContact}
                  disabled={isDeclining}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#fff',
                    color: '#64748B',
                    fontWeight: 500,
                    fontSize: '12px',
                    cursor: isDeclining ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isDeclining ? 'Declining…' : '✕ Decline'}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#475569'
              }}
            >
              <CheckCircle2 size={15} color="#10B981" />
              <span>
                Accepted contact in <strong>People & Relationships</strong>
              </span>
            </div>
          )}

          {/* 2. Hero Contact Identity Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                {/* Initials Avatar */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                  }}
                >
                  {contact.name
                    ? contact.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'U'}
                </div>

                <div>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {contact.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', color: '#64748B', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {!isPlaceholderValue(contact.title) ? contact.title : 'Professional'}
                    </span>
                    <span>·</span>
                    <span
                      style={{
                        color: !isPlaceholderValue(contact.company) ? '#475569' : '#94A3B8',
                        fontStyle: isPlaceholderValue(contact.company) ? 'italic' : 'normal'
                      }}
                    >
                      {!isPlaceholderValue(contact.company) ? contact.company : 'Company Unverified'}
                    </span>
                    {contact.location && !isPlaceholderValue(contact.location) && (
                      <>
                        <span>·</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={13} color="#94A3B8" /> {contact.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status / Gate Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Audited Identity Verification Pill */}
                {identityResStatus === 'CONFIRMED' || identityConfidence >= 80 ? (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#ECFDF5',
                      color: '#047857',
                      border: '1px solid #A7F3D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Executive identity confirmed against authoritative profile anchors. (Deterministic match score: not a statistical probability)"
                  >
                    <CheckCircle2 size={13} />
                    Identity Confirmed (Score: {identityConfidence}/100)
                  </span>
                ) : identityResStatus === 'PROBABLE' || identityConfidence >= 60 ? (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Identity match is probable via web indexing; pending primary official confirmation. (Deterministic match score: not a statistical probability)"
                  >
                    <Info size={13} />
                    Identity Probable (Score: {identityConfidence}/100)
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#FFFBEB',
                      color: '#B45309',
                      border: '1px solid #FDE68A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title={identityGateReason || 'Executive identity ambiguous across sources. Commercial scenarios suppressed.'}
                  >
                    <AlertTriangle size={13} />
                    Identity Ambiguous (Score: {identityConfidence}/100)
                  </span>
                )}

                {/* Career Provenance Verification Gate Pill */}
                {!isGatePassed && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#FFFBEB',
                      color: '#B45309',
                      border: '1px solid #FDE68A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title={identityGateReason || 'Career history unverified. Commercial proposals withheld until verified employment history is retrieved.'}
                  >
                    <AlertTriangle size={13} />
                    Career Details Unverified
                  </span>
                )}

                {/* Network Tier Pill */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {contact.tier || "Bhanu's Network"}
                </span>

                {/* LinkedIn Profile Link */}
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    LinkedIn <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 3. Clean Modern Tab Navigation Strip */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: activeTab === 'overview' ? 700 : 500,
                color: activeTab === 'overview' ? '#2563EB' : '#64748B',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'overview' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={15} />
              Profile &amp; Context
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('commercial')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: activeTab === 'commercial' ? 700 : 500,
                color: activeTab === 'commercial' ? '#2563EB' : '#64748B',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'commercial' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Target size={15} />
              Strategic Fit &amp; Opportunity
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: pipelineStage === 'VALIDATED' ? '#ECFDF5' : '#F1F5F9',
                  color: pipelineStage === 'VALIDATED' ? '#047857' : '#64748B',
                  fontWeight: 600
                }}
              >
                {pipelineStage}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: activeTab === 'evidence' ? 700 : 500,
                color: activeTab === 'evidence' ? '#2563EB' : '#64748B',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'evidence' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Search size={15} />
              Sources &amp; Evidence
              {sourcesCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    color: '#64748B',
                    fontWeight: 600
                  }}
                >
                  {sourcesCount}
                </span>
              )}
            </button>
          </div>

          {/* 4. Tab Contents */}

          {/* TAB 1: PROFILE & CONTEXT */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Executive Bio & Professional Background */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <User size={16} color="#2563EB" />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Executive Bio &amp; Expertise
                  </h3>
                </div>

                <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
                  {contact.personIntelligence?.background && contact.personIntelligence.background !== 'No background found.' ? (
                    contact.personIntelligence.background
                  ) : (
                    <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                      Profile background summary will be generated once verified career history is retrieved.
                    </span>
                  )}
                </div>

                {/* Expertise Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Primary Domain:</span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    {contact.commercialIntelligence?.domainName || 'General Operations'}
                  </span>
                  {contact.personIntelligence?.decisionInfluence && contact.personIntelligence.decisionInfluence !== 'Unknown' && (
                    <span
                      style={{
                        fontSize: '12px',
                        background: '#F1F5F9',
                        color: '#475569',
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      Scope: {contact.personIntelligence.decisionInfluence}
                    </span>
                  )}
                </div>
              </div>

              {/* Company Intelligence & Architecture Card */}
              <CompanyIntelligenceCard
                contactId={contact.id}
                companyName={contact.company}
                onCompanyUpdated={() => {
                  queryClient.invalidateQueries({ queryKey: ['contact', id] });
                  queryClient.invalidateQueries({ queryKey: ['contacts'] });
                }}
              />

              {/* Relationship & Network Door */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Calendar size={16} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Relationship &amp; Introduction Context
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Connection Source</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '4px' }}>
                      Bhanu&rsquo;s 1st-Degree Network
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Relationship Strength</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '4px' }}>
                      {contact.relationship?.strength || 'New Connection'}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Conversation Notes</div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                      {contact.relationship?.notes || 'No founder notes recorded yet.'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: STRATEGIC FIT & COMMERCIAL OPPORTUNITY */}
          {activeTab === 'commercial' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Commercial Governance & Action Toolbar */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Founder Commercial Review Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background:
                            pipelineStage === 'VALIDATED'
                              ? '#ECFDF5'
                              : pipelineStage === 'REJECTED'
                              ? '#FEF2F2'
                              : pipelineStage === 'ON_HOLD'
                              ? '#F1F5F9'
                              : '#EFF6FF',
                          color:
                            pipelineStage === 'VALIDATED'
                              ? '#047857'
                              : pipelineStage === 'REJECTED'
                              ? '#991B1B'
                              : pipelineStage === 'ON_HOLD'
                              ? '#475569'
                              : '#1D4ED8',
                          border: `1px solid ${
                            pipelineStage === 'VALIDATED' ? '#A7F3D0' : pipelineStage === 'REJECTED' ? '#FECACA' : '#E2E8F0'
                          }`
                        }}
                      >
                        {pipelineStage === 'VALIDATED'
                          ? '✓ VALIDATED (Founder Confirmed)'
                          : pipelineStage === 'REJECTED'
                          ? '✕ DECLINED'
                          : pipelineStage === 'ON_HOLD'
                          ? '⏸ ON HOLD'
                          : pipelineStage === 'UNCERTAIN_IDENTITY'
                          ? '⚠️ UNCERTAIN IDENTITY'
                          : 'PROPOSED (Requires Review)'}
                      </span>
                    </div>
                  </div>

                  {/* Commercial Decision Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleValidateAction('VALIDATED')}
                      disabled={!isGatePassed || pipelineStage === 'VALIDATED' || isValidating}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: pipelineStage === 'VALIDATED' ? '#E2E8F0' : '#059669',
                        color: pipelineStage === 'VALIDATED' ? '#94A3B8' : '#FFFFFF',
                        border: 'none',
                        cursor: !isGatePassed || pipelineStage === 'VALIDATED' ? 'not-allowed' : 'pointer',
                        opacity: !isGatePassed ? 0.5 : 1
                      }}
                      title={!isGatePassed ? `Blocked: ${identityGateReason || 'Target identity unverified'}` : 'Validate opportunity'}
                    >
                      ✓ Validate Opportunity
                    </button>

                    <button
                      type="button"
                      onClick={() => handleValidateAction('ON_HOLD')}
                      disabled={pipelineStage === 'ON_HOLD' || isValidating}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        cursor: pipelineStage === 'ON_HOLD' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Put On Hold
                    </button>

                    <button
                      type="button"
                      onClick={() => handleValidateAction('REJECTED')}
                      disabled={pipelineStage === 'REJECTED' || isValidating}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        cursor: pipelineStage === 'REJECTED' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>

                {/* Audit Record if reviewed */}
                {contact.commercialIntelligence?.opportunityValidation?.reviewedBy && (
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                    Decision recorded by <strong>{contact.commercialIntelligence.opportunityValidation.reviewedBy}</strong>
                    {contact.commercialIntelligence.opportunityValidation.reviewedAt && (
                      <> on {new Date(contact.commercialIntelligence.opportunityValidation.reviewedAt).toLocaleDateString()}</>
                    )}
                    {contact.commercialIntelligence.opportunityValidation.reviewNotes && (
                      <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                        &ldquo;{contact.commercialIntelligence.opportunityValidation.reviewNotes}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Safeguard Notice if Identity is unverified */}
                {!isGatePassed && (
                  <div
                    style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '12px',
                      color: '#92400E'
                    }}
                  >
                    <AlertTriangle size={16} color="#D97706" />
                    <div>
                      <strong>Commercial Safeguard Active:</strong> {identityGateReason || 'Identity is unverified'}. Validation and automated outreach are paused until role and organization are confirmed.
                    </div>
                  </div>
                )}
              </div>

              {/* Observed Problem & Internal Product Fit Card */}
              <SemanticProductMatchCard
                contactId={contact.id}
                contactName={contact.name}
                contactCompany={contact.company}
                contactTitle={contact.title}
                defaultProblem={contact.commercialIntelligence?.broadBusinessProblem || contact.commercialIntelligence?.smallestSolvableProblem || ''}
                onMatchResult={setProductMatch}
              />

              {/* Scoped Problem & Delivery Hypotheses */}
              {contact.commercialIntelligence && (
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '14px'
                  }}
                >
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Smallest Solvable Problem
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '6px' }}>
                      {contact.commercialIntelligence.smallestSolvableProblem || 'Pending discovery'}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Ottobon Capability Match
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '6px' }}>
                      {contact.commercialIntelligence.ottobonCapabilityMatch || 'AI Applications & Development'}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Estimated Scope &amp; Effort
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '1px 5px', borderRadius: '3px' }}>
                        HYPOTHESIS
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                      {contact.commercialIntelligence.estimatedEffortHours || 'Pending discovery interview'}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Commercial Model
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '1px 5px', borderRadius: '3px' }}>
                        HYPOTHESIS
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                      {contact.commercialIntelligence.costPricingEstimate || 'Milestone Sprint / Scoped Engagement'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOURCES & RESEARCH EVIDENCE */}
          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Consulted Sources Summary */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Search size={16} color="#2563EB" />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Consulted Sources &amp; Coverage ({sourcesCount})
                  </h3>
                </div>

                {contact.commercialIntelligence?.sourcesUsed && contact.commercialIntelligence.sourcesUsed.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                    {contact.commercialIntelligence.sourcesUsed.map((src, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', color: '#1E293B' }}>
                            {src.source_id.replace('_', ' ')}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: src.status === 'SUCCESS' ? '#ECFDF5' : '#F1F5F9',
                              color: src.status === 'SUCCESS' ? '#047857' : '#64748B'
                            }}
                          >
                            {src.status}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#64748B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={src.reference}
                        >
                          {src.reference}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#64748B' }}>No source queries recorded.</div>
                )}
              </div>

              {/* ========================================================= */}
              {/* 4-SECTION EPISTEMIC VERIFICATION DOSSIER */}
              {/* ========================================================= */}

              {/* SECTION 1: VERIFIED FACTS */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#059669" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      Verified Background Facts
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#ECFDF5',
                      color: '#047857',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #A7F3D0'
                    }}
                  >
                    {verifiedFacts.length} Verified
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  Claims verified against primary authoritative sources (e.g. direct LinkedIn profile or official company website) with confirmed executive identity.
                </div>

                {verifiedFacts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {verifiedFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderLeft: '4px solid #10B981',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                            {fact.claim}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                background: '#ECFDF5',
                                color: '#047857',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              VERIFIED
                            </span>
                            {fact.authorityTier && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                {fact.authorityTier.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {fact.quote && fact.quote !== fact.claim && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#334155',
                              fontStyle: 'italic',
                              background: '#FFFFFF',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0',
                              marginTop: '2px'
                            }}
                          >
                            &ldquo;{fact.quote}&rdquo;
                          </div>
                        )}

                        {fact.sourceUrl && (
                          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Source:</span>
                            <span style={{ color: '#2563EB', wordBreak: 'break-all' }}>{fact.sourceUrl}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '12px',
                      color: '#64748B'
                    }}
                  >
                    No claims meet strict primary official verification criteria yet. Collected observations are retained below under <strong>Signals &amp; Observed Context</strong>.
                  </div>
                )}
              </div>

              {/* SECTION 2: SIGNALS & OBSERVED CONTEXT */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={18} color="#2563EB" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      Signals &amp; Observed Context
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    {signalsContext.length} Signals
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  Observations extracted from web search and media mentions. Provenance confirmed, but source authority is unverified web or identity match is probable.
                </div>

                {signalsContext.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {signalsContext.map((sig, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderLeft: '4px solid #3B82F6',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                            {sig.claim}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            PARTIALLY SUPPORTED
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', fontSize: '11px', color: '#64748B' }}>
                          {sig.sourceUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>Source:</span>
                              <span style={{ color: '#475569' }}>{sig.sourceUrl}</span>
                            </div>
                          )}
                          {sig.observedDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={11} />
                              <span>Observed: {sig.observedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                    No secondary signals recorded.
                  </div>
                )}
              </div>

              {/* SECTION 3: COMMERCIAL HYPOTHESES */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={18} color="#6366F1" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      Commercial Hypotheses
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #C7D2FE'
                    }}
                  >
                    AI Sales Inferences
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  Inferred business challenges, Ottobon capability match, and commercial projections. Clearly demarcated as sales inferences, not confirmed client requirements.
                </div>

                {commercialHypotheses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {commercialHypotheses.map((hyp, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#FAFAFE',
                          border: '1px solid #E0E7FF',
                          borderRadius: '8px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#EEF2FF',
                              color: '#4338CA',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              letterSpacing: '0.02em'
                            }}
                          >
                            HYPOTHESIS #{idx + 1}
                          </span>
                          {hyp.trigger_claim_ids && hyp.trigger_claim_ids.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>Motivated by Evidence:</span>
                              {hyp.trigger_claim_ids.map(cid => (
                                <span
                                  key={cid}
                                  style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '10px',
                                    background: '#EFF6FF',
                                    color: '#1D4ED8',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    border: '1px solid #BFDBFE'
                                  }}
                                >
                                  [{cid}]
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                              Inferred Pain Point
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                              {hyp.inferred_pain_point || 'Operational challenge'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                              Ottobon Capability Match
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                              {hyp.ottobon_capability_offering || 'Development'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Effort Hypothesis: <strong style={{ color: '#334155' }}>{hyp.estimated_effort_hours || 'Pending Scoping'}</strong>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Pricing Hypothesis: <strong style={{ color: '#334155' }}>{hyp.pricing_scenario || 'Indicative assumption'}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                    No commercial hypotheses generated.
                  </div>
                )}
              </div>

              {/* SECTION 4: CONFLICTS & QUARANTINED CLAIMS */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#DC2626" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      Conflicts &amp; Quarantined Claims
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: conflictsQuarantined.length > 0 ? '#FEF2F2' : '#F1F5F9',
                      color: conflictsQuarantined.length > 0 ? '#991B1B' : '#64748B',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: `1px solid ${conflictsQuarantined.length > 0 ? '#FECACA' : '#E2E8F0'}`
                    }}
                  >
                    {conflictsQuarantined.length} Flagged
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  Contradictory claims, unverified quotes, ambiguous identities, or stale career states. Strictly withheld from verified background facts.
                </div>

                {conflictsQuarantined.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {conflictsQuarantined.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#FFF8F8',
                          border: '1px solid #FEE2E2',
                          borderLeft: '4px solid #EF4444',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#FEE2E2',
                              color: '#991B1B',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {item.issueType?.replace(/_/g, ' ') || 'QUARANTINED CLAIM'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#DC2626' }}>
                            {item.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#450A0A', marginTop: '2px' }}>
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '12px',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>No conflicting or quarantined claims detected across research sources.</span>
                  </div>
                )}
              </div>

              {/* Traceable Citations Drawer Trigger List */}
              {contact.commercialIntelligence?.evidenceMap && Object.keys(contact.commercialIntelligence.evidenceMap).length > 0 && (
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <ShieldCheck size={16} color="#059669" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Grounded Evidence Citations
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(contact.commercialIntelligence.evidenceMap).map(([key, evItem]) => (
                      <div
                        key={key}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '11px',
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #BFDBFE'
                            }}
                          >
                            [{key}]
                          </span>
                          <span style={{ fontSize: '12px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {evItem.claim}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const eid = evItem.evidence_id || evItem.id;
                            if (eid) {
                              openEvidenceDrawer(eid, evItem.evidence_type || 'FACT', evItem.claim || `Evidence ${key}`, contact.id);
                            }
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '5px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#2563EB',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          View Excerpt
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Full AI Research Report */}
              {processedReport && (
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowFullReport(!showFullReport)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <FileText size={16} color="#475569" />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Traceable AI Intelligence Report
                      </span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '5px 12px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Download report as Markdown file (.md)"
                      >
                        <Download size={13} />
                        Download Report (.md)
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowFullReport(!showFullReport)}
                        style={{
                          fontSize: '12px',
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 6px'
                        }}
                      >
                        {showFullReport ? 'Collapse' : 'Expand'}
                        {showFullReport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {showFullReport && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', lineHeight: '1.6' }}>
                      <div className="markdown-body">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children, ...props }) => {
                              if (href && href.startsWith('#evidence-')) {
                                const citationKey = href.replace('#evidence-', '');
                                const evItem = contact.commercialIntelligence?.evidenceMap?.[citationKey];
                                const evidenceId = evItem?.evidence_id || evItem?.id;
                                return (
                                  <button
                                    type="button"
                                    className="citation-badge"
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (evidenceId) {
                                        openEvidenceDrawer(
                                          evidenceId,
                                          evItem?.evidence_type || 'FACT',
                                          evItem?.claim || `Evidence ${citationKey}`,
                                          contact.id
                                        );
                                      }
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      padding: '1px 6px',
                                      margin: '0 2px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      fontFamily: 'monospace',
                                      color: '#1D4ED8',
                                      background: '#EFF6FF',
                                      border: '1px solid #BFDBFE',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {children}
                                  </button>
                                );
                              }
                              return (
                                <a href={href} target="_blank" rel="noreferrer" {...props}>
                                  {children}
                                </a>
                              );
                            }
                          }}
                        >
                          {processedReport}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Confirm Decision: {targetStatus}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                &times;
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Review Notes &amp; Rationale:
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Enter discovery rationale or next step context..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                disabled={isValidating}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitValidation}
                disabled={isValidating}
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: targetStatus === 'VALIDATED' ? '#059669' : targetStatus === 'REJECTED' ? '#DC2626' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isValidating ? 'Saving...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
