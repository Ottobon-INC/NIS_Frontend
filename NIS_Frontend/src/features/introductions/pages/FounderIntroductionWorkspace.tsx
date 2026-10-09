import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useIntroductionRecommendation, useUpdateIntroductionDraft, useUpdateIntroductionStatus } from '../../../hooks/useIntroduction';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import type { IntroductionStatus } from '../../../services/api/introduction.api';

export const FounderIntroductionWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  
  const { data: intro, isLoading, isError } = useIntroductionRecommendation(id || '');
  const draftMutation = useUpdateIntroductionDraft(id || '');
  const statusMutation = useUpdateIntroductionStatus(id || '');

  const [draftContent, setDraftContent] = useState('');

  useEffect(() => {
    if (intro?.messageDraft) {
      setDraftContent(intro.messageDraft);
    }
  }, [intro?.messageDraft]);

  if (!id) return <div>Invalid Opportunity ID</div>;

  const handleSaveDraft = () => {
    if (intro) {
      draftMutation.mutate({ introId: intro.id, messageDraft: draftContent });
      // Also silently mark as FOUNDER_EDITED if it was DRAFT
      if (intro.status === 'DRAFT') {
        statusMutation.mutate({ introId: intro.id, status: 'FOUNDER_EDITED' });
      }
    }
  };

  const handleStatusChange = (status: IntroductionStatus) => {
    if (intro) {
      statusMutation.mutate({ introId: intro.id, status });
    }
  };

  const isApproved = intro?.status === 'APPROVED_FOR_INTRODUCTION';
  const isRejected = intro?.status === 'REJECTED';

  return (
    <WorkspaceShell
      title="Founder Introduction Intelligence"
      subtitle="Review the introduction recommendation, verify mutual value, and approve the message draft."
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: intro?.context.opportunityTitle || 'Detail', path: `/opportunities/${id}` },
        { label: 'Network Matching', path: `/opportunities/${id}/network-matching` },
        { label: 'Introduction', path: `/opportunities/${id}/introduction` }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !intro}
      emptyStateMessage="No introduction recommendation available for this opportunity."
    >
      {intro && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          
          {/* Top Context Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-6)' }}>
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <h3 className="labels text-secondary" style={{ margin: 0 }}>Introduction Target</h3>
                <button 
                  className="button-text"
                  onClick={() => navigate(`/people/${intro.personId}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                >
                  View Person &rarr;
                </button>
              </div>
              <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{intro.context.personName}</p>
              <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>{intro.context.companyName}</p>
              <p className="body-text text-secondary" style={{ margin: 0 }}>Opportunity: <span className="body-text-important" style={{ color: 'var(--color-text-primary)' }}>{intro.context.opportunityTitle}</span></p>
            </section>
            
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Selected Capability</h3>
              <p className="body-text-important" style={{ margin: 0 }}>{intro.context.capabilityName}</p>
            </section>

            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Network Match</h3>
              <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{intro.context.networkMatchName}</p>
              <p className="body-text text-secondary" style={{ margin: 0 }}>{intro.context.networkMatchCompany}</p>
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            {/* Left Column: Reasoning & Mutual Value */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              
              <section style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="section-title" style={{ margin: '0 0 var(--space-6) 0' }}>Why This Introduction?</h3>
                <p className="body-text" style={{ margin: '0 0 var(--space-6) 0' }}>{intro.introductionReason}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <TrustBadge level="INFERENCE" />
                    <span className="metadata text-secondary">Confidence: {intro.confidence}%</span>
                  </div>
                  <button 
                    className="button-text"
                    onClick={() => openEvidenceDrawer(intro.evidenceIds[0], 'INFERENCE', 'Introduction Recommendation')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                  >
                    View Supporting Evidence
                  </button>
                </div>
              </section>

              <section style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="section-title" style={{ margin: '0 0 var(--space-6) 0' }}>Relationship Context</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="metadata text-secondary">Role</span>
                    <span className="body-text-important">{intro.context.relationshipRole}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="metadata text-secondary">Strength</span>
                    <span className="body-text-important" style={{ color: intro.context.relationshipStrength === 'STRONG' ? 'var(--color-success)' : 'inherit' }}>
                      {intro.context.relationshipStrength}
                    </span>
                  </div>
                </div>
              </section>

              <section style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="section-title" style={{ margin: '0 0 var(--space-6) 0' }}>Mutual Value</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>How They Help Us</h4>
                    <p className="body-text" style={{ margin: 0 }}>{intro.mutualValue.howTheyHelpUs}</p>
                  </div>
                  <div>
                    <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>How We Help Them</h4>
                    <p className="body-text" style={{ margin: 0 }}>{intro.mutualValue.howWeHelpThem}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Draft & Decision */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              
              <section style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                  <h3 className="section-title" style={{ margin: 0 }}>Message Draft</h3>
                  <span className="labels text-secondary" style={{ background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    {intro.status === 'DRAFT' ? 'SYSTEM-GENERATED' : 'FOUNDER-EDITED'}
                  </span>
                </div>
                
                <textarea 
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onBlur={handleSaveDraft}
                  disabled={isApproved || isRejected || statusMutation.isPending}
                  style={{ 
                    flex: 1, 
                    minHeight: '250px',
                    width: '100%', 
                    padding: 'var(--space-4)', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--color-border)', 
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    background: (isApproved || isRejected) ? '#f8fafc' : '#fff',
                    color: (isApproved || isRejected) ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'
                  }}
                />
                
                {!isApproved && !isRejected && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Changes save automatically.
                    </span>
                  </div>
                )}
              </section>

              <section style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                {isApproved ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span>✓</span> APPROVED FOR INTRODUCTION
                      </p>
                      <p className="body-text text-secondary" style={{ margin: 0 }}>
                        The introduction has been reviewed and approved by the founder.
                      </p>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>Ready for founder-controlled introduction.</p>
                      <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>No message has been sent automatically.</p>
                      <button 
                        className="button-text"
                        onClick={() => navigate(`/opportunities/${id}/post-introduction`)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                      >
                        Proceed to Outcome & Feedback &rarr;
                      </button>
                    </div>
                  </div>
                ) : isRejected ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <p className="body-text-important" style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span>✕</span> INTRODUCTION REJECTED
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="section-title" style={{ margin: '0 0 var(--space-6) 0' }}>Founder Attention</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <button 
                        className="button-text"
                        onClick={() => handleStatusChange('APPROVED_FOR_INTRODUCTION')}
                        disabled={statusMutation.isPending}
                        style={{ flex: 1, padding: '0.875rem', background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      >
                        Approve Introduction
                      </button>
                      <button 
                        className="button-text"
                        onClick={() => handleStatusChange('REJECTED')}
                        disabled={statusMutation.isPending}
                        style={{ flex: 1, padding: '0.875rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </section>

            </div>
          </div>

        </div>
      )}
    </WorkspaceShell>
  );
};
