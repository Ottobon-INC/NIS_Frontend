import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Network, 
  Send
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity, useValidateOpportunity } from '../../../hooks/useOpportunities';
import { useUIStore } from '../../../store/uiStore';
import type { Opportunity } from '../../../services/api/opportunities.api';

interface JobLinkInfo {
  url: string;
  source: string;
  label: string;
}

export const OpportunityDetailWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'solution' | 'network' | 'introductions' | 'activity'>('overview');
  
  const { data: opp, isLoading, isError } = useOpportunity(id || '');
  const validateMutation = useValidateOpportunity(id || '');

  if (!id) return <div>Invalid Opportunity ID</div>;

  // Extract and deduplicate all job links
  const getAllJobLinks = (opportunity: Opportunity): JobLinkInfo[] => {
    const links: JobLinkInfo[] = [];
    const seen = new Set<string>();

    const addLink = (url: string | null | undefined, sourceHint?: string) => {
      if (!url || typeof url !== 'string' || !url.startsWith('http') || seen.has(url)) return;
      seen.add(url);
      let hostname = '';
      try {
        hostname = new URL(url).hostname.replace('www.', '');
      } catch {
        hostname = 'Job Board';
      }
      let sourceName = sourceHint || hostname;
      const lowerHost = hostname.toLowerCase();
      if (lowerHost.includes('weworkremotely')) sourceName = 'We Work Remotely';
      else if (lowerHost.includes('remotive')) sourceName = 'Remotive';
      else if (lowerHost.includes('jobicy')) sourceName = 'Jobicy';
      else if (lowerHost.includes('arbeitnow')) sourceName = 'Arbeitnow';

      links.push({
        url,
        source: sourceName,
        label: `${sourceName} (${hostname})`
      });
    };

    if (opportunity.scrapedJobs && Array.isArray(opportunity.scrapedJobs)) {
      for (const sj of opportunity.scrapedJobs) {
        addLink(sj.applyUrl, sj.source);
        if (sj.canonicalApplyUrl) addLink(sj.canonicalApplyUrl, sj.source);
      }
    }
    if (opportunity.applyUrl) {
      addLink(opportunity.applyUrl);
    }
    if (opportunity.supportingEvidenceIds && Array.isArray(opportunity.supportingEvidenceIds)) {
      for (const ev of opportunity.supportingEvidenceIds) {
        if (typeof ev === 'string' && ev.startsWith('http')) {
          addLink(ev);
        }
      }
    }
    if (opportunity.description && typeof opportunity.description === 'string') {
      const match = opportunity.description.match(/(?:Direct Apply|Apply|URL):\s*(https?:\/\/[^\s\n\r\)]+)/i);
      if (match && match[1]) {
        addLink(match[1]);
      }
    }
    return links;
  };

  const jobLinks = opp ? getAllJobLinks(opp) : [];
  const primaryApplyUrl = opp?.applyUrl || (jobLinks.length > 0 ? jobLinks[0].url : null);
  const isJobOpening = opp?.opportunityType === 'JOB_OPENING' || !!primaryApplyUrl;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const subtitleText = opp
    ? (isJobOpening
        ? `Official Job Opening · ${opp.companyName}`
        : `${opp.personName || 'Unassigned Executive'} · ${opp.companyName}`)
    : '';

  return (
    <WorkspaceShell
      title={opp?.title || 'Opportunity Detail'}
      subtitle={subtitleText}
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && !opp}
      headerActions={
        primaryApplyUrl ? (
          <a
            href={primaryApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#2563EB',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Apply for this Position ↗</span>
          </a>
        ) : null
      }
      primaryAction={
        opp?.status === 'CANDIDATE' 
          ? { 
              label: validateMutation.isPending ? 'Validating...' : 'Validate Opportunity', 
              onClick: () => validateMutation.mutate(),
              disabled: validateMutation.isPending
            }
          : {
              label: 'Proceed to Solution Matching',
              onClick: () => navigate(`/opportunities/${id}/matching`),
              disabled: opp?.status !== 'VALIDATED'
            }
      }
    >
      {opp && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Action & Priority Sub-bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '8px'
          }}>
            <button
              onClick={() => navigate('/opportunities')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Opportunities</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: opp.confidence >= 80 ? '#FEF2F2' : '#FEF3C7',
                color: opp.confidence >= 80 ? '#B91C1C' : '#B45309',
                border: `1px solid ${opp.confidence >= 80 ? '#FEE2E2' : '#FDE68A'}`
              }}>
                {opp.confidence >= 80 ? 'High Priority' : 'Medium Priority'}
              </span>

              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: opp.status === 'VALIDATED' ? '#ECFDF5' : '#EFF6FF',
                color: opp.status === 'VALIDATED' ? '#047857' : '#1D4ED8',
                border: `1px solid ${opp.status === 'VALIDATED' ? '#A7F3D0' : '#DBEAFE'}`
              }}>
                {opp.status === 'VALIDATED' ? 'Validated' : 'In Analysis'}
              </span>
            </div>
          </div>

          {/* Segmented Tabs Strip (Screen 5) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderBottom: '1px solid #E2E8F0',
            marginBottom: '4px'
          }}>
            {[
              { key: 'overview', label: 'Overview', path: `/opportunities/${id}` },
              { key: 'solution', label: 'Solution Matching', path: `/opportunities/${id}/matching` },
              { key: 'network', label: 'Network Matching', path: `/opportunities/${id}/network-matching` },
              { key: 'introductions', label: 'Introductions', path: `/opportunities/${id}/introduction` },
              { key: 'activity', label: 'Activity', path: `/opportunities/${id}/post-introduction` },
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    if (tab.key !== 'overview') navigate(tab.path);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563EB' : '#64748B',
                    borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                    marginBottom: '-1px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Screen 5: 3-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '290px minmax(0, 1fr) 310px',
            gap: '20px',
            alignItems: 'start'
          }}>
            
            {/* COLUMN 1 (LEFT): Opportunity Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Opportunity Details
                </h3>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Company / Target
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>
                    <Building2 size={16} color="#2563EB" />
                    <span>{opp.companyName}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Opportunity Type
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: '1px solid #E2E8F0'
                  }}>
                    {opp.opportunityType === 'JOB_OPENING' ? 'Job Opening' : opp.opportunityType}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Stage
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: opp.status === 'VALIDATED' ? '#10B981' : '#2563EB'
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      {opp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Priority
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: opp.confidence >= 80 ? '#FEF2F2' : '#FEF3C7',
                    color: opp.confidence >= 80 ? '#B91C1C' : '#B45309'
                  }}>
                    {opp.confidence >= 80 ? 'HIGH' : 'MEDIUM'}
                  </span>
                </div>

                {opp.personName && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Key Contact
                    </span>
                    <button
                      onClick={() => opp.personId && navigate(`/people/${opp.personId}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: opp.personId ? 'pointer' : 'default',
                        padding: 0
                      }}
                    >
                      <User size={14} />
                      <span>{opp.personName}</span>
                    </button>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                    <span>Created</span>
                    <span style={{ fontWeight: 500, color: '#1E293B' }}>{new Date(opp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                    <span>Updated</span>
                    <span style={{ fontWeight: 500, color: '#1E293B' }}>{new Date(opp.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Confidence</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: opp.confidence >= 80 ? '#047857' : '#1D4ED8' }}>
                      {opp.confidence}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${opp.confidence}%`,
                      height: '100%',
                      background: opp.confidence >= 80 ? '#10B981' : '#3B82F6',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2 (CENTER): Summary, Problem Statement & Next Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Validation Error Banner */}
              {validateMutation.isError && (
                <div style={{
                  padding: '14px 18px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  color: '#991B1B',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>Validation Failed:</strong> {(validateMutation.error as any)?.message || 'An error occurred during validation.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => validateMutation.reset()}
                    style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Candidate / Review Warning Banner */}
              {opp.status === 'CANDIDATE' && (
                <div style={{
                  padding: '14px 18px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <p style={{ margin: 0, color: '#92400E', fontSize: '13px' }}>
                    <strong>System-Suggested Opportunity:</strong> Requires founder validation before advancing to capability matching.
                  </p>
                  <button
                    onClick={() => validateMutation.mutate()}
                    disabled={validateMutation.isPending}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: '#D97706',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {validateMutation.isPending ? 'Validating...' : 'Validate Now'}
                  </button>
                </div>
              )}

              {/* Problem Statement Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Underlying Problem Statement
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#1E293B' }}>
                    {opp.problem}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Explicit Requirements
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                    {opp.requirement}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                      Timeline Signal
                    </span>
                    <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500 }}>
                      {opp.timeline || 'Active commercial cycle'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                      Budget Signal
                    </span>
                    <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500 }}>
                      {opp.budgetSignal || 'Disclosed during discovery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps Interactive Checklist (Screen 5 specification) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommended Next Steps
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div 
                    onClick={() => navigate(`/opportunities/${id}/matching`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={16} color="#2563EB" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        1. Review capability matches
                      </span>
                    </div>
                    <ChevronRight size={14} color="#64748B" />
                  </div>

                  <div 
                    onClick={() => navigate(`/opportunities/${id}/network-matching`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Network size={16} color="#64748B" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        2. Evaluate network connections
                      </span>
                    </div>
                    <ChevronRight size={14} color="#64748B" />
                  </div>

                  <div 
                    onClick={() => navigate(`/opportunities/${id}/introduction`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Send size={16} color="#64748B" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        3. Prepare warm introduction request
                      </span>
                    </div>
                    <ChevronRight size={14} color="#64748B" />
                  </div>
                </div>
              </div>

              {/* Prominent Job Links (if Job Opening) */}
              {isJobOpening && primaryApplyUrl && (
                <div style={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #C7D2FE',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4338CA', textTransform: 'uppercase' }}>
                      Official Job Posting
                    </span>
                    <a
                      href={primaryApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Visit External Link ↗
                    </a>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1'
                  }}>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {primaryApplyUrl}
                    </span>
                    <button
                      onClick={() => handleCopy(primaryApplyUrl)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        background: copiedUrl === primaryApplyUrl ? '#ECFDF5' : '#F8FAFC',
                        color: copiedUrl === primaryApplyUrl ? '#047857' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedUrl === primaryApplyUrl ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3 (RIGHT): Key Matches & Lifecycle Progression */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Key Matches Summary Card (Screen 5 specification) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Key Matches
                </h3>

                <div 
                  onClick={() => navigate(`/opportunities/${id}/matching`)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={16} color="#2563EB" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Capabilities</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>3 Available Solutions</div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#64748B" />
                </div>

                <div 
                  onClick={() => navigate(`/opportunities/${id}/network-matching`)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Network size={16} color="#10B981" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Network Connections</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>5 Warm Connections</div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#64748B" />
                </div>

                {opp.status === 'CANDIDATE' ? (
                  <button
                    onClick={() => validateMutation.mutate()}
                    disabled={validateMutation.isPending}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    {validateMutation.isPending ? 'Validating...' : 'Validate Opportunity'}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/opportunities/${id}/matching`)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    Proceed to Matching →
                  </button>
                )}
              </div>

              {/* Lifecycle Progression Stepper */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Progression Stepper
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Opportunity Identified', done: true },
                    { label: 'Validated by Founder', done: opp.status === 'VALIDATED' || (opp.status as string) === 'IN_PROGRESS' || opp.status === 'SOLUTION_MATCHING' || opp.status === 'PATH_DEFINED' },
                    { label: 'Capability Matched', done: (opp.status as string) === 'IN_PROGRESS' || opp.status === 'SOLUTION_MATCHING' || opp.status === 'PATH_DEFINED' },
                    { label: 'Network Matched', done: (opp.status as string) === 'IN_PROGRESS' || opp.status === 'PATH_DEFINED' },
                    { label: 'Warm Intro Approved', done: false }
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: step.done ? '#ECFDF5' : '#F1F5F9',
                        color: step.done ? '#047857' : '#94A3B8',
                        border: `1px solid ${step.done ? '#A7F3D0' : '#E2E8F0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700
                      }}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ color: step.done ? '#0F172A' : '#64748B', fontWeight: step.done ? 600 : 400 }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aggregated Evidence Drawer Trigger */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <ShieldCheck size={16} color="#2563EB" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Evidence & Provenance</span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748B' }}>
                  Confidence rating based on verified scraped data & authoritative references.
                </p>
                <button
                  onClick={() => openEvidenceDrawer(opp.id, opp.status === 'VALIDATED' ? 'CONFIRMED' : 'INFERENCE', opp.title)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Evidence Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
