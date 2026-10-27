import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  CheckSquare, 
  Square, 
  Sparkles,
  Save
} from 'lucide-react';
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
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeContext, setIncludeContext] = useState(true);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [includeNextSteps, setIncludeNextSteps] = useState(true);

  useEffect(() => {
    if (intro?.messageDraft) {
      setDraftContent(intro.messageDraft);
    }
  }, [intro?.messageDraft]);

  if (!id) return <div>Invalid Opportunity ID</div>;

  const handleSaveDraft = () => {
    if (intro) {
      draftMutation.mutate({ introId: intro.id, messageDraft: draftContent });
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
      title="Request Introduction"
      subtitle="Prepare an introduction to connect the right people"
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: intro?.context.opportunityTitle || 'Detail', path: `/opportunities/${id}` },
        { label: 'Network Matching', path: `/opportunities/${id}/network-matching` },
        { label: 'Request Introduction', path: `/opportunities/${id}/introduction` }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !intro}
      emptyStateMessage="No introduction recommendation available for this opportunity."
      primaryAction={
        isApproved ? {
          label: 'Proceed to Post-Introduction Tracking →',
          onClick: () => navigate(`/opportunities/${id}/post-introduction`),
          disabled: false
        } : undefined
      }
    >
      {intro && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Action Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => navigate(`/opportunities/${id}/network-matching`)}
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
              <span>Back to Network Matching</span>
            </button>

            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Target Opportunity: <strong>{intro.context?.opportunityTitle || 'Enterprise Pilot'}</strong>
            </span>
          </div>

          {/* 3-Step Stepper (Screen 8 specification) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>
                ✓
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Step 1</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Select Connection</div>
              </div>
            </div>

            <div style={{ flex: 1, height: '2px', background: '#2563EB', margin: '0 16px' }} />

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>
                2
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, textTransform: 'uppercase' }}>Step 2 (Active)</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Review &amp; Edit Draft</div>
              </div>
            </div>

            <div style={{ flex: 1, height: '2px', background: isApproved ? '#2563EB' : '#E2E8F0', margin: '0 16px' }} />

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isApproved ? '#ECFDF5' : '#F1F5F9',
                color: isApproved ? '#047857' : '#94A3B8',
                border: `1px solid ${isApproved ? '#A7F3D0' : '#E2E8F0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {isApproved ? '✓' : '3'}
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Step 3</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: isApproved ? '#0F172A' : '#64748B' }}>Send Request</div>
              </div>
            </div>
          </div>

          {/* 2-Column Split (Screen 8 specification) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
            gap: '24px',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: Target Intermediary, Reasoning, and Message Draft */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Target Intermediary Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    color: '#2563EB',
                    fontSize: '16px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {((intro.context?.personName || 'Priya Sharma')).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      Target Connection / Intermediary
                    </span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                      {intro.context?.personName || 'Connection'}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                      {intro.context?.companyName || 'Target Company'}
                    </p>
                  </div>
                </div>

                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0'
                }}>
                  {intro.context?.relationshipStrength || 'Strong'} Connection
                </span>
              </div>

              {/* Why This Connection Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#2563EB" />
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why This Connection?
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {intro.introductionReason || 'Strategic investor with deep ties to enterprise procurement leads and AI portfolio companies.'}
                </p>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrustBadge level="INFERENCE" />
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Confidence: {intro.confidence || 92}%</span>
                  </div>
                  <button
                    onClick={() => openEvidenceDrawer(intro.evidenceIds?.[0] || 'ev-1', 'INFERENCE', 'Introduction Recommendation')}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    View Supporting Evidence
                  </button>
                </div>
              </div>

              {/* Editable Message Draft Textarea */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      Message Draft
                    </h4>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#F1F5F9',
                      color: '#64748B'
                    }}>
                      {intro.status === 'DRAFT' ? 'AI Generated' : 'Founder Edited'}
                    </span>
                  </div>

                  <button
                    onClick={handleSaveDraft}
                    disabled={isApproved || isRejected || draftMutation.isPending}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={12} />
                    <span>{draftMutation.isPending ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                </div>

                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onBlur={handleSaveDraft}
                  disabled={isApproved || isRejected}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                    color: '#0F172A',
                    background: isApproved || isRejected ? '#F8FAFC' : '#FFFFFF',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                  <span>{draftContent.length} characters</span>
                  <span>Changes auto-save upon editing</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 'Include in request' checklist & Approval Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Checklist Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Include in Request Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div 
                    onClick={() => setIncludeSummary(!includeSummary)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#1E293B' }}
                  >
                    {includeSummary ? <CheckSquare size={16} color="#2563EB" /> : <Square size={16} color="#94A3B8" />}
                    <span>Opportunity summary &amp; context</span>
                  </div>

                  <div 
                    onClick={() => setIncludeContext(!includeContext)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#1E293B' }}
                  >
                    {includeContext ? <CheckSquare size={16} color="#2563EB" /> : <Square size={16} color="#94A3B8" />}
                    <span>Your context &amp; relationship rationale</span>
                  </div>

                  <div 
                    onClick={() => setIncludeBackground(!includeBackground)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#1E293B' }}
                  >
                    {includeBackground ? <CheckSquare size={16} color="#2563EB" /> : <Square size={16} color="#94A3B8" />}
                    <span>Relevant background &amp; portfolio signals</span>
                  </div>

                  <div 
                    onClick={() => setIncludeNextSteps(!includeNextSteps)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#1E293B' }}
                  >
                    {includeNextSteps ? <CheckSquare size={16} color="#2563EB" /> : <Square size={16} color="#94A3B8" />}
                    <span>Suggested next steps &amp; agenda</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {isApproved ? (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '13px' }}>
                        <CheckCircle2 size={16} />
                        <span>Introduction Approved</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#065F46' }}>
                        Ready for founder-controlled introduction dispatch.
                      </p>
                    </div>
                  ) : isRejected ? (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#B91C1C',
                      fontSize: '13px',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      Introduction Rejected
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleStatusChange('APPROVED_FOR_INTRODUCTION')}
                        disabled={statusMutation.isPending}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: '8px',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send size={14} />
                        <span>Approve Introduction</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange('REJECTED')}
                        disabled={statusMutation.isPending}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                          color: '#64748B',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        Decline / Reject
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => navigate(`/opportunities/${id}/post-introduction`)}
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
                      Proceed to Tracking →
                    </button>
                  )}
                </div>
              </div>

              {/* Mutual Value Summary Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mutual Value Rationale
                </h4>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    How they help us
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#1E293B', lineHeight: '1.4' }}>
                    {intro.mutualValue?.howTheyHelpUs || 'Direct executive warm referral to Tier-1 CTO/CISO buying committees.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    How we help them
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#1E293B', lineHeight: '1.4' }}>
                    {intro.mutualValue?.howWeHelpThem || 'Turnkey bounded governance bridge reducing enterprise AI compliance liabilities.'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
