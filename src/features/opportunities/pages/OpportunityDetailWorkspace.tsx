import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity, useValidateOpportunity } from '../../../hooks/useOpportunities';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
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
              borderRadius: 'var(--radius-sm)',
              background: '#4338ca',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(67, 56, 202, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3730a3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4338ca';
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
              label: 'Proceed to Solution & Capability Matching',
              onClick: () => navigate(`/opportunities/${id}/matching`),
              disabled: opp?.status !== 'VALIDATED'
            }
      }
    >
      {opp && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-7)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {/* Validation Error Banner */}
            {validateMutation.isError && (
              <div style={{
                padding: 'var(--space-4)',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-lg)',
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
                  &times;
                </button>
              </div>
            )}

            {/* Candidate / Review Warning Banner */}
            {opp.status === 'CANDIDATE' && (
              <div style={{ padding: 'var(--space-4)', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)' }}>
                <p className="body-text-important" style={{ margin: 0, color: '#92400e' }}>
                  <strong>System-Suggested Opportunity:</strong> This opportunity was generated from verified research and requires Founder Validation before it can proceed to Matching.
                </p>
              </div>
            )}

            {/* Prominent Job Links & Official Posting Box (for Job Openings) */}
            {isJobOpening && (
              <section style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #c7d2fe',
                boxShadow: '0 2px 8px rgba(67, 56, 202, 0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: '#4338ca',
                      color: '#ffffff'
                    }}>
                      💼 Official Job Opening
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e1b4b' }}>
                      {opp.companyName} · {opp.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Sourced: {new Date(opp.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Primary Apply Link Input Bar */}
                {primaryApplyUrl && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#ffffff',
                      padding: '8px 10px 8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #cbd5e1',
                      marginBottom: jobLinks.length > 1 ? 'var(--space-4)' : 0
                    }}>
                      <span style={{ fontSize: '15px', color: '#6366f1' }}>🔗</span>
                      <a
                        href={primaryApplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#3730a3',
                          fontWeight: 500,
                          textDecoration: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={primaryApplyUrl}
                      >
                        {primaryApplyUrl}
                      </a>
                      <button
                        onClick={() => handleCopy(primaryApplyUrl)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1',
                          background: copiedUrl === primaryApplyUrl ? '#ecfdf5' : '#f8fafc',
                          color: copiedUrl === primaryApplyUrl ? '#047857' : '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {copiedUrl === primaryApplyUrl ? '✓ Copied!' : 'Copy Link'}
                      </button>
                      <a
                        href={primaryApplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          background: '#4338ca',
                          color: '#ffffff',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#3730a3'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#4338ca'; }}
                      >
                        Open Job Posting ↗
                      </a>
                    </div>
                  </div>
                )}

                {/* Additional Cross-Source Links if multiple exist */}
                {jobLinks.length > 1 && (
                  <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid #e2e8f0', paddingTop: 'var(--space-3)' }}>
                    <p style={{ margin: '0 0 var(--space-2) 0', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
                      All Linked Postings ({jobLinks.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {jobLinks.map((link, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', background: '#ffffff', padding: '6px 12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600, color: '#4338ca', whiteSpace: 'nowrap' }}>{link.source}:</span>
                            <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button
                              onClick={() => handleCopy(link.url)}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                            >
                              {copiedUrl === link.url ? '✓ Copied' : 'Copy'}
                            </button>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#4338ca', fontWeight: 600, textDecoration: 'none', fontSize: '11px' }}
                            >
                              Visit ↗
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Why This Opportunity Exists */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-6) 0', textTransform: 'uppercase' }}>Why This Opportunity Exists</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div>
                  <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Underlying Problem / Hiring Need</h3>
                  <p className="body-text" style={{ margin: 0 }}>{opp.problem}</p>
                </div>
                
                <div>
                  <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Explicit Requirement / Target Profile</h3>
                  <p className="body-text" style={{ margin: 0 }}>{opp.requirement}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Hiring Timeline</h3>
                    <p className="body-text" style={{ margin: 0, color: opp.timeline ? 'inherit' : 'var(--color-text-secondary)' }}>
                      {opp.timeline || 'Active recruitment underway.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Budget / Compensation Signal</h3>
                    <p className="body-text" style={{ margin: 0, color: opp.budgetSignal ? 'inherit' : 'var(--color-text-secondary)' }}>
                      {opp.budgetSignal || 'Disclosed in job posting.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Full Job Description Section (if available) */}
            {opp.description && (
              <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h2 className="section-title" style={{ margin: 0, textTransform: 'uppercase' }}>
                    Full Job Posting & Role Details
                  </h2>
                  {primaryApplyUrl && (
                    <a
                      href={primaryApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: '#4338ca',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      Apply on External Board ↗
                    </a>
                  )}
                </div>
                <div style={{
                  padding: 'var(--space-5)',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  maxHeight: '450px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {opp.description}
                </div>
              </section>
            )}

            {/* Product & Capability Fit (if matched) */}
            {opp.matchedProductName && (
              <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h2 className="section-title" style={{ margin: 0, textTransform: 'uppercase' }}>Ottobon Product Fit</h2>
                  {opp.matchScore !== null && opp.matchScore !== undefined && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', background: '#F0FDF4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                      Fit Score: {opp.matchScore}%
                    </span>
                  )}
                </div>
                <div style={{ padding: 'var(--space-4)', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: '14px', color: '#1E293B', fontWeight: 600 }}>
                    {opp.matchedProductName}
                  </h4>
                  {opp.matchRationale && (
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                      {opp.matchRationale}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Review Audit Record (if validated or reviewed) */}
            {opp.reviewedBy && (
              <section style={{ background: '#F0FDF4', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                    Founder Review Confirmed ({opp.status})
                  </span>
                  <span style={{ fontSize: '11px', color: '#15803D' }}>
                    Reviewed by <strong>{opp.reviewedBy}</strong>
                    {opp.reviewedAt && <> on {new Date(opp.reviewedAt).toLocaleString()}</>}
                  </span>
                </div>
                {opp.reviewNotes && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: '#166534' }}>
                    &ldquo;{opp.reviewNotes}&rdquo;
                  </p>
                )}
              </section>
            )}

            {/* Trusted Context & Evidence Provenance */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 className="section-title" style={{ margin: 0, textTransform: 'uppercase' }}>Trusted Context & Provenance</h2>
                {opp.personId && (
                  <button 
                    className="button-text"
                    onClick={() => navigate(`/people/${opp.personId}/context`)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                  >
                    View Full Contact Context
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {opp.trustedContextIds && opp.trustedContextIds.length > 0 ? (
                  opp.trustedContextIds.map(tcId => (
                    <div key={tcId} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-brand-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <TrustBadge level="CONFIRMED" />
                        <span className="metadata text-secondary">Trusted Context ID: {tcId}</span>
                      </div>
                      <p className="body-text" style={{ margin: 0 }}>
                        This opportunity was directly derived from verified intelligence and trusted context.
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                    <p className="body-text text-secondary" style={{ margin: 0 }}>
                      Created via Opportunity Intelligence Engine with verified commercial signals.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            
            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Opportunity State</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: opp.status === 'VALIDATED' ? 'var(--color-success)' : '#f59e0b' }} />
                <span className="body-text-important">{opp.status.replace('_', ' ')}</span>
              </div>
              
              {opp.status === 'VALIDATED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  
                  <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <h4 className="labels text-secondary" style={{ marginBottom: 'var(--space-4)' }}>Lifecycle Progression</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span className="body-text-important" style={{ color: 'var(--color-success)' }}>✓</span><span className="metadata">VALIDATED</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>○</span><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>CAPABILITY MATCHED</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>○</span><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>NETWORK MATCHED</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>○</span><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>INTRODUCTION APPROVED</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>○</span><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>POST-INTRODUCTION & OUTCOME</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Workspaces</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <button className="button-text" onClick={() => navigate(`/opportunities/${id}/matching`)} style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                        1. Capability Matching &rarr;
                      </button>
                      <button className="button-text" onClick={() => navigate(`/opportunities/${id}/network-matching`)} style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                        2. Network Matching &rarr;
                      </button>
                      <button className="button-text" onClick={() => navigate(`/opportunities/${id}/introduction`)} style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                        3. Founder Introduction &rarr;
                      </button>
                      <button className="button-text" onClick={() => navigate(`/opportunities/${id}/post-introduction`)} style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                        4. Outcome & Feedback &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Source & Origin Sidebar */}
            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>
                {isJobOpening ? 'Job Source & Sourcing' : 'Source & Origin'}
              </h3>
              
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <p className="body-text-important" style={{ margin: '0 0 var(--space-1) 0' }}>{opp.companyName}</p>
                <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>
                  {isJobOpening 
                    ? (jobLinks.length > 0 ? `Sourced from ${jobLinks[0].source}` : 'External Job Board')
                    : (opp.personName || 'Unassigned Executive')}
                </p>

                {primaryApplyUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={primaryApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--color-brand-primary)',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Official Job Board Link ↗
                    </a>
                  </div>
                )}

                {opp.personId ? (
                  <button 
                    className="button-text"
                    onClick={() => navigate(`/people/${opp.personId}`)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0, marginTop: '8px', display: 'block' }}
                  >
                    View Contact 360 &rarr;
                  </button>
                ) : null}
              </div>

              {opp.sourceMeetingId && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  <p className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Source Meeting</p>
                  <p className="body-text" style={{ margin: '0 0 var(--space-2) 0' }}>Meeting ID: {opp.sourceMeetingId}</p>
                  <button 
                    className="button-text"
                    onClick={() => navigate(`/meetings/${opp.sourceMeetingId}/brief`)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                  >
                    View Meeting Brief &rarr;
                  </button>
                </div>
              )}
            </section>

            {/* Evidence Trace Sidebar */}
            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Evidence Trace</h3>
              <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Opportunity Confidence: <strong>{opp.confidence}%</strong>
              </p>

              {/* Verified Job Links List in Evidence */}
              {jobLinks.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
                    Verified Sourcing Citations:
                  </span>
                  {jobLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        color: '#4338ca',
                        background: '#ffffff',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid #c7d2fe',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block'
                      }}
                      title={link.url}
                    >
                      ↗ {link.source}
                    </a>
                  ))}
                </div>
              )}

              <button 
                onClick={() => openEvidenceDrawer(opp.id, opp.status === 'VALIDATED' ? 'CONFIRMED' : 'INFERENCE', opp.title)}
                className="button-text"
                style={{ width: '100%', padding: 'var(--space-3)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                View Aggregated Evidence
              </button>
            </section>

          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
