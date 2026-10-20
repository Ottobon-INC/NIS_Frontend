import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContact360 } from '../../../hooks/useContact360';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import { contactsApi } from '../../../services/api/contacts.api';
import { CompanyIntelligenceCard } from '../components/CompanyIntelligenceCard';
import { SemanticProductMatchCard } from '../components/SemanticProductMatchCard';

export const Contact360Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openEvidenceDrawer } = useUIStore();
  const { data: contact, isLoading, isError } = useContact360(id || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
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

  const reportContent = contact?.full_markdown_report;
  const processedReport = React.useMemo(() => {
    if (!reportContent) return '';
    // Replace citations like [E1], [E2] with markdown links [E1](#evidence-E1)
    // Avoid double-wrapping if already formatted
    return reportContent.replace(/(?<!\[)\[(E\d+)\](?!\()/g, '[$1](#evidence-$1)');
  }, [reportContent]);

  if (!id) return <div>Invalid Contact ID</div>;

  return (
    <WorkspaceShell
      title={contact ? `${contact.name}` : 'Loading...'}
      subtitle={contact ? `${contact.title} · ${contact.company}` : ''}
      breadcrumbs={[{ label: 'People', path: '/people' }, { label: contact?.name || 'Contact 360', path: `/people/${id}` }]}
      primaryAction={{ label: 'Prepare Meeting', onClick: () => navigate(`/meetings/${id}/brief`) }}
      secondaryActions={[
        { label: 'Executive Summary', onClick: () => navigate(`/people/${id}/transcript`), variant: 'primary' },
        { label: isDeleting ? 'Deleting...' : 'Delete Contact', onClick: handleDelete, variant: 'danger', disabled: isDeleting }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={false}
    >
      {contact && contact.full_markdown_report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          {/* Company Intelligence & Hiring Signals Card at the VERY TOP */}
          <CompanyIntelligenceCard
            contactId={contact.id}
            companyName={contact.company}
            onCompanyUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['contact', id] });
              queryClient.invalidateQueries({ queryKey: ['contacts'] });
            }}
          />

          {contact.commercialIntelligence && (
            <div style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              {/* Header with Badges & Safeguards */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: contact.commercialIntelligence.provenanceStatus === 'VERIFIED CURRENT' ? '#ECFDF5' : '#FFFBEB',
                    color: contact.commercialIntelligence.provenanceStatus === 'VERIFIED CURRENT' ? '#047857' : '#B45309',
                    border: `1px solid ${contact.commercialIntelligence.provenanceStatus === 'VERIFIED CURRENT' ? '#A7F3D0' : '#FDE68A'}`
                  }}>
                    {contact.commercialIntelligence.provenanceStatus}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-brand-primary)',
                    background: '#EEF2FF',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {contact.commercialIntelligence.opportunityCategory || 'Commercial Opportunity'}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: contact.commercialIntelligence.deliveryRiskLevel === 'LOW' ? '#059669' : contact.commercialIntelligence.deliveryRiskLevel === 'HIGH' ? '#DC2626' : '#D97706'
                  }}>
                    Delivery Risk: {contact.commercialIntelligence.deliveryRiskLevel || 'LOW'}
                  </span>

                  {/* Identity Gate Badge */}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: contact.commercialIntelligence.opportunityValidation?.identityGatePassed ? '#F0FDF4' : '#FEF2F2',
                    color: contact.commercialIntelligence.opportunityValidation?.identityGatePassed ? '#166534' : '#991B1B',
                    border: `1px solid ${contact.commercialIntelligence.opportunityValidation?.identityGatePassed ? '#BBF7D0' : '#FECACA'}`
                  }}>
                    {contact.commercialIntelligence.opportunityValidation?.identityGatePassed
                      ? `✓ Identity Gate Passed (${contact.commercialIntelligence.opportunityValidation?.identityConfidence ?? 100}%)`
                      : `⛔ Identity Gate Blocked (${contact.commercialIntelligence.opportunityValidation?.identityConfidence ?? 0}% < 70%)`}
                  </span>
                </div>

                {/* Explicit Opportunity State Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Opportunity State:</span>
                  {(() => {
                    const st = contact.commercialIntelligence.pipelineStage || 'PROPOSED';
                    const isVal = st === 'VALIDATED';
                    const isRej = st === 'REJECTED';
                    const isHold = st === 'ON_HOLD';
                    const isUncert = st === 'UNCERTAIN_IDENTITY';
                    const bg = isVal ? '#ECFDF5' : isRej ? '#FEF2F2' : isHold ? '#F1F5F9' : isUncert ? '#FEF2F2' : '#EFF6FF';
                    const col = isVal ? '#047857' : isRej ? '#991B1B' : isHold ? '#475569' : isUncert ? '#B91C1C' : '#1D4ED8';
                    const label = isVal ? 'VALIDATED (Founder Confirmed)'
                      : isRej ? 'REJECTED / DECLINED'
                      : isHold ? 'ON HOLD'
                      : isUncert ? 'UNCERTAIN IDENTITY (<70%)'
                      : 'PROPOSED (Requires Human Review)';
                    return (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: col,
                        background: bg,
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: `1px solid ${col}33`
                      }}>
                        {label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Identity Gate Block Warning */}
              {contact.commercialIntelligence.opportunityValidation?.canValidate === false && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: '13px',
                  color: '#991B1B'
                }}>
                  <span style={{ fontWeight: 700 }}>⛔ Commercial Decision Safeguard:</span>
                  <span>Target identity confidence is insufficient ({contact.commercialIntelligence.opportunityValidation?.identityConfidence ?? 0}% &lt; 70%). Human validation is disabled until identity is confirmed.</span>
                </div>
              )}

              {/* Review Audit Record (if reviewed) */}
              {contact.commercialIntelligence.opportunityValidation?.reviewedBy && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: contact.commercialIntelligence.pipelineStage === 'VALIDATED' ? '#F0FDF4' : '#F8FAFC',
                  border: `1px solid ${contact.commercialIntelligence.pipelineStage === 'VALIDATED' ? '#BBF7D0' : '#E2E8F0'}`,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: contact.commercialIntelligence.pipelineStage === 'VALIDATED' ? '#15803D' : '#475569' }}>
                      Review Decision: {contact.commercialIntelligence.pipelineStage}
                    </span>
                    <span style={{ color: '#64748B' }}>
                      Reviewed by: <strong>{contact.commercialIntelligence.opportunityValidation.reviewedBy}</strong>
                      {contact.commercialIntelligence.opportunityValidation.reviewedAt && (
                        <> on {new Date(contact.commercialIntelligence.opportunityValidation.reviewedAt).toLocaleString()}</>
                      )}
                    </span>
                  </div>
                  {contact.commercialIntelligence.opportunityValidation.reviewNotes && (
                    <div style={{ fontStyle: 'italic', color: '#475569', marginTop: '2px' }}>
                      &ldquo;{contact.commercialIntelligence.opportunityValidation.reviewNotes}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {/* Commercial Decision Controls Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                background: '#F8FAFC',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                  Founder Commercial Action:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleValidateAction('VALIDATED')}
                    disabled={contact.commercialIntelligence.opportunityValidation?.canValidate === false || contact.commercialIntelligence.pipelineStage === 'VALIDATED' || isValidating}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: contact.commercialIntelligence.pipelineStage === 'VALIDATED' ? '#E2E8F0' : '#059669',
                      color: contact.commercialIntelligence.pipelineStage === 'VALIDATED' ? '#94A3B8' : '#fff',
                      border: 'none',
                      cursor: contact.commercialIntelligence.opportunityValidation?.canValidate === false || contact.commercialIntelligence.pipelineStage === 'VALIDATED' ? 'not-allowed' : 'pointer',
                      opacity: contact.commercialIntelligence.opportunityValidation?.canValidate === false ? 0.5 : 1,
                      transition: 'all 0.15s ease'
                    }}
                    title={contact.commercialIntelligence.opportunityValidation?.canValidate === false ? 'Blocked: Target identity is unverified (<70%)' : 'Validate candidate opportunity for outreach'}
                  >
                    ✓ Validate Opportunity
                  </button>

                  <button
                    type="button"
                    onClick={() => handleValidateAction('ON_HOLD')}
                    disabled={contact.commercialIntelligence.pipelineStage === 'ON_HOLD' || isValidating}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: '#fff',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      cursor: contact.commercialIntelligence.pipelineStage === 'ON_HOLD' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Put On Hold
                  </button>

                  <button
                    type="button"
                    onClick={() => handleValidateAction('REJECTED')}
                    disabled={contact.commercialIntelligence.pipelineStage === 'REJECTED' || isValidating}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: '#fff',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      cursor: contact.commercialIntelligence.pipelineStage === 'REJECTED' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Decline / Reject
                  </button>

                  {(contact.commercialIntelligence.pipelineStage === 'VALIDATED' || contact.commercialIntelligence.pipelineStage === 'REJECTED' || contact.commercialIntelligence.pipelineStage === 'ON_HOLD') && (
                    <button
                      type="button"
                      onClick={() => handleValidateAction('PROPOSED')}
                      disabled={isValidating}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-sm)',
                        background: '#fff',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      Reset to Proposed
                    </button>
                  )}
                </div>
              </div>

              {/* Commercial Assumptions & Catalog Gap Notice */}
              <div style={{
                fontSize: '11px',
                color: '#64748B',
                background: '#F1F5F9',
                padding: '6px 12px',
                borderRadius: '4px',
                lineHeight: '1.4'
              }}>
                <strong>Governance Note:</strong> AI opportunity discovery creates candidate hypotheses based on publicly observed data. Indicative pricing ($10k&ndash;$20k), delivery effort hours, and customer budget authority are unverified assumptions. Ottobon rate cards and confirmed buyer authority must be verified through founder discovery.
              </div>


              {contact.commercialIntelligence.smallestSolvableProblem && (
                <div style={{
                  padding: 'var(--space-4)',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid #4F46E5'
                }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                    Smallest Worthwhile Solvable Problem
                  </div>
                  <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>
                    {contact.commercialIntelligence.smallestSolvableProblem}
                  </div>
                </div>
              )}

              {contact.commercialIntelligence.sourcesUsed && contact.commercialIntelligence.sourcesUsed.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700 }}>
                    Sources ({contact.commercialIntelligence.sourcesUsed.length}):
                  </span>
                  {contact.commercialIntelligence.sourcesUsed.map((src, i) => (
                    <span key={i} style={{
                      fontSize: '11px',
                      background: '#F1F5F9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#334155',
                      maxWidth: '260px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={src.reference}>
                      <strong style={{ textTransform: 'capitalize' }}>{src.source_id.replace('_', ' ')}</strong>: {src.reference}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Observed Problem & Internal Product Fit */}
          {contact && (
            <SemanticProductMatchCard
              contactId={contact?.id || id || ''}
              contactName={contact.name}
              contactCompany={contact.company}
              contactTitle={contact.title}
              defaultProblem={contact.commercialIntelligence?.broadBusinessProblem || contact.commercialIntelligence?.smallestSolvableProblem || ''}
            />
          )}

          <section style={{ padding: 'var(--space-8)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', lineHeight: '1.6' }}>
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (evidenceId) {
                              openEvidenceDrawer(evidenceId, evItem?.evidence_type || 'FACT', evItem?.claim || `Evidence ${citationKey}`, contact.id);
                            } else {
                              console.warn(`Evidence for citation [${citationKey}] not found in evidenceMap.`);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '1px 7px',
                            margin: '0 2px',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#1E40AF',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '4px',
                            cursor: evidenceId ? 'pointer' : 'default',
                            textDecoration: 'none',
                            verticalAlign: 'baseline',
                            lineHeight: '1.3',
                            transition: 'all 0.15s ease',
                          }}
                          title={evItem ? `[${citationKey}] ${evItem.claim} (${evItem.source_id})` : `Citation ${citationKey}`}
                        >
                          [{children}]
                        </button>
                      );
                    }
                    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                  }
                }}
              >
                {processedReport}
              </ReactMarkdown>
            </div>
          </section>
        </div>
      ) : contact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          {/* Company Intelligence & Hiring Signals Card at the VERY TOP */}
          <CompanyIntelligenceCard
            contactId={contact.id}
            companyName={contact.company}
            onCompanyUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['contact', id] });
              queryClient.invalidateQueries({ queryKey: ['contacts'] });
            }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            {/* Person Intelligence */}
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Person Intelligence</h2>
              {contact.personIntelligence ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <span className="labels text-secondary">Background</span>
                    <p className="body-text" style={{ margin: 'var(--space-1) 0 0 0' }}>{contact.personIntelligence.background}</p>
                  </div>
                  <div>
                    <span className="labels text-secondary">Decision Influence</span>
                    <p className="body-text" style={{ margin: 'var(--space-1) 0 0 0' }}>{contact.personIntelligence.decisionInfluence}</p>
                  </div>
                </div>
              ) : (
                <p className="body-text text-secondary">Person intelligence is not available yet.</p>
              )}
            </section>

            {/* Company Intelligence */}
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Company Intelligence</h2>
              {contact.companyIntelligence ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <span className="labels text-secondary">Industry & Context</span>
                    <p className="body-text" style={{ margin: 'var(--space-1) 0 0 0' }}>{contact.companyIntelligence.industry}. {contact.companyIntelligence.context}</p>
                  </div>
                  <div>
                    <span className="labels text-secondary">Growth Signals</span>
                    <p className="body-text" style={{ margin: 'var(--space-1) 0 0 0' }}>{contact.companyIntelligence.growthSignals}</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Company intelligence is still being enriched.</p>
              )}
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            {/* How They Help Us */}
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>How They Help Us</h2>
              {contact.howTheyHelpUs && contact.howTheyHelpUs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {contact.howTheyHelpUs.map((item, idx) => (
                    <div key={idx} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <span className="body-text-important">{item.role}</span>
                        <TrustBadge level={item.level} />
                      </div>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>{item.reasoning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No role hypothesis currently exists.</p>
              )}
            </section>

            {/* How We Help Them */}
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>How We Help Them</h2>
              {contact.howWeHelpThem && contact.howWeHelpThem.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {contact.howWeHelpThem.map((item, idx) => (
                    <div key={idx} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <span className="body-text-important">{item.need}</span>
                        <TrustBadge level={item.level} />
                      </div>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Potential fit: {item.capability}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No capability match hypothesis currently exists.</p>
              )}
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            {/* Signals */}
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Signals</h2>
              {contact.signals && contact.signals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {contact.signals.map(sig => (
                    <div key={sig.id} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <span className="body-text-important">{sig.title}</span>
                        <TrustBadge level={sig.level} />
                      </div>
                      <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-sm)' }}>{sig.description}</p>
                      <p style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}><strong>Why it matters:</strong> {sig.whyItMatters}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="labels" style={{ color: 'var(--color-success)' }}>Confidence: {sig.confidence}%</span>
                        {sig.evidenceId && (
                          <button 
                            className="button-text"
                            onClick={() => openEvidenceDrawer(sig.evidenceId!, sig.level, sig.title, contact.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                          >
                            View Evidence
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No significant signals detected.</p>
              )}
            </section>

            {/* Relationship Engine & Current Context */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Relationship Engine</h2>
                {contact.relationship ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Strength</span>
                      <span className="body-text-important">{contact.relationship.strength}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Type</span>
                      <span className="body-text-important">{contact.relationship.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Previous Interactions</span>
                      <span className="body-text-important">{contact.relationship.previousInteractions}</span>
                    </div>
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Founder Notes</span>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>"{contact.relationship.notes}"</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No relationship history available.</p>
                )}
              </section>

              <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Current Context</h2>
                {contact.currentContext ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Recent Meetings</span>
                      <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                        {contact.currentContext.recentMeetings.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Active Pipeline</span>
                      {contact.currentContext.activeOpportunities.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                          {contact.currentContext.activeOpportunities.map((o, i) => (
                            <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                              <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{o}</p>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginLeft: 'var(--space-2)', borderLeft: '2px solid var(--color-border)', paddingLeft: 'var(--space-3)' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                  <span style={{ color: 'var(--color-text-secondary)', marginRight: 'var(--space-2)' }}>Introduction:</span>
                                  <span className="body-text-important">Alan Turing &rarr; Sarah Connor</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                  <span style={{ color: 'var(--color-text-secondary)', marginRight: 'var(--space-2)' }}>Conversations:</span>
                                  <span className="body-text-important">2 conversations recorded</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                  <span style={{ color: 'var(--color-text-secondary)', marginRight: 'var(--space-2)' }}>Outcome:</span>
                                  <span className="body-text-important" style={{ color: 'var(--color-success)' }}>Opportunity progressing</span>
                                </div>
                              </div>

                              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
                                <button 
                                  onClick={() => navigate(`/opportunities/opp-1`)} 
                                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'var(--font-size-sm)' }}
                                >
                                  View Opportunity
                                </button>
                                <button 
                                  onClick={() => navigate(`/opportunities/opp-1/post-introduction`)} 
                                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'var(--font-size-sm)' }}
                                >
                                  View Pipeline & Outcome
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>No active pipelines.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No active context.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Human Opportunity Review Modal */}
      {showReviewModal && (

        <div style={{
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
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            padding: 'var(--space-6)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                Human Commercial Review: {targetStatus}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
              {targetStatus === 'VALIDATED' && (
                <p style={{ margin: 0 }}>
                  <strong>Confirming Qualified Opportunity:</strong> You are certifying that this commercial opportunity is backed by sufficient evidence, customer pain points have been reviewed, and Ottobon delivery feasibility is confirmed.
                </p>
              )}
              {targetStatus === 'ON_HOLD' && (
                <p style={{ margin: 0 }}>
                  <strong>Marking On Hold:</strong> The opportunity is viable but no immediate commercial action will be taken at this time.
                </p>
              )}
              {targetStatus === 'REJECTED' && (
                <p style={{ margin: 0 }}>
                  <strong>Declining Opportunity:</strong> The opportunity does not match current capabilities, client need, or acceptable risk parameters.
                </p>
              )}
              {targetStatus === 'PROPOSED' && (
                <p style={{ margin: 0 }}>
                  <strong>Resetting to Proposed:</strong> Returning this opportunity to candidate state awaiting founder review.
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Review Notes &amp; Rationale:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter review notes, confirmed problem scope, client discovery context, or reason for decision..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                disabled={isValidating}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
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
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  background: targetStatus === 'VALIDATED' ? '#059669' : targetStatus === 'REJECTED' ? '#DC2626' : '#2563EB',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isValidating ? 'Recording...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};

