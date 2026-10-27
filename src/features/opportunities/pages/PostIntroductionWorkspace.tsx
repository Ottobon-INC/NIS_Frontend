import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  MessageSquare
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity } from '../../../hooks/useOpportunities';
import { usePostIntroductionData, useMarkIntroductionMade, useAddConversation, useUpdateOutcome, useSubmitFeedback } from '../../../hooks/usePostIntroduction';
import type { IntroChannel, OutcomeType, NetworkFeedback } from '../../../services/api/postIntroduction.api';

export const PostIntroductionWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: opp, isLoading: isOppLoading } = useOpportunity(id || '');
  const { data: postData, isLoading: isPostLoading, isError } = usePostIntroductionData(id || '');
  
  const introMadeMutation = useMarkIntroductionMade(id || '');
  const addConvMutation = useAddConversation(id || '');
  const updateOutcomeMutation = useUpdateOutcome(id || '');
  const submitFeedbackMutation = useSubmitFeedback(id || '');

  // Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'activity' | 'outcomes'>('overview');

  // Local state for forms
  const [introChannel, setIntroChannel] = useState<IntroChannel>('EMAIL');
  const [convNotes, setConvNotes] = useState('');
  const [outcomeType, setOutcomeType] = useState<OutcomeType>('PENDING');
  const [outcomeWhat, setOutcomeWhat] = useState('');
  const [fbNetwork, setFbNetwork] = useState<NetworkFeedback>('NETWORK_MATCH_STRONG');

  if (!id) return <div>Invalid Opportunity ID</div>;

  const handleMarkMade = () => {
    introMadeMutation.mutate({ status: 'MADE', channel: introChannel });
  };

  const handleAddConversation = () => {
    if (!convNotes.trim()) return;
    addConvMutation.mutate({
      status: 'ACTIVE',
      founderNotes: convNotes.trim(),
      date: new Date().toISOString()
    });
    setConvNotes('');
  };

  const handleUpdateOutcome = () => {
    if (!outcomeWhat.trim()) return;
    updateOutcomeMutation.mutate({
      outcomeType,
      whatHappened: outcomeWhat.trim()
    });
  };

  const handleSubmitFeedback = () => {
    submitFeedbackMutation.mutate({
      capabilityFeedback: 'MATCH_ACCURATE',
      networkFeedback: fbNetwork,
      introductionFeedback: 'INTRODUCTION_USEFUL',
      trustedContextFeedback: 'CONTEXT_ACCURATE',
      founderLearning: 'Good match process overall.'
    });
  };

  const isIntroMade = postData?.introductionExecution?.status === 'MADE';
  const personName = opp?.personName || 'Key Connection';

  return (
    <WorkspaceShell
      title={`Introduction with ${personName}`}
      subtitle={opp ? `${opp.title} · ${opp.companyName}` : 'Track progress, conversation notes, and commercial outcomes'}
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` },
        { label: 'Post Introduction Tracking', path: `/opportunities/${id}/post-introduction` }
      ]}
      isLoading={isOppLoading || isPostLoading}
      isError={isError}
      isEmpty={!isOppLoading && !isPostLoading && !postData}
      emptyStateMessage="No post-introduction tracking data found for this opportunity."
    >
      {opp && postData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Action Back Button & Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => navigate(`/opportunities/${id}`)}
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
              <span>Back to Opportunity</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Sent: <strong>{new Date().toLocaleDateString()}</strong>
              </span>

              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: isIntroMade ? '#ECFDF5' : '#FEF3C7',
                color: isIntroMade ? '#047857' : '#B45309',
                border: `1px solid ${isIntroMade ? '#A7F3D0' : '#FDE68A'}`
              }}>
                {isIntroMade ? 'In Progress' : 'Pending Send'}
              </span>
            </div>
          </div>

          {/* Segmented Tabs Strip (Screen 9 specification) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '0'
          }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'messages', label: 'Messages' },
              { key: 'activity', label: 'Activity' },
              { key: 'outcomes', label: 'Outcomes' },
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
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

          {/* 2-Column Grid (Screen 9 specification) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 360px) minmax(0, 1fr)',
            gap: '24px',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: Introduction Details & Deal Outcome */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Introduction Details Card */}
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
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Introduction Details
                </h3>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Connection
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#EEF2FF',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {personName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', display: 'block' }}>
                        {personName}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Company / Target
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                    <Building2 size={14} color="#64748B" />
                    <span>{opp.companyName}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Target Opportunity
                  </span>
                  <span style={{ fontSize: '13px', color: '#334155' }}>
                    {opp.title}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Dispatch Channel
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #E2E8F0'
                  }}>
                    {postData.introductionExecution?.channel || introChannel}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Execution Status
                  </span>
                  {isIntroMade ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#047857',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      <CheckCircle2 size={16} />
                      <span>Introduction Made &amp; Active</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <select
                        value={introChannel}
                        onChange={e => setIntroChannel(e.target.value as IntroChannel)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '13px',
                          background: '#FFFFFF',
                          outline: 'none'
                        }}
                      >
                        <option value="EMAIL">Email</option>
                        <option value="LINKEDIN">LinkedIn InMail</option>
                        <option value="PHONE">Phone / WhatsApp</option>
                      </select>
                      <button
                        onClick={handleMarkMade}
                        disabled={introMadeMutation.isPending}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '6px',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Introduction as Made
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Commercial Outcome Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Commercial Outcome
                </h3>

                {postData.outcome ? (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: postData.outcome.outcomeType === 'WON' ? '#ECFDF5' : '#F8FAFC',
                    border: `1px solid ${postData.outcome.outcomeType === 'WON' ? '#A7F3D0' : '#E2E8F0'}`
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: postData.outcome.outcomeType === 'WON' ? '#047857' : '#475569',
                      color: '#FFFFFF',
                      marginBottom: '6px'
                    }}>
                      OUTCOME: {postData.outcome.outcomeType}
                    </span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: '1.4' }}>
                      {postData.outcome.whatHappened}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select
                      value={outcomeType}
                      onChange={e => setOutcomeType(e.target.value as OutcomeType)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        background: '#FFFFFF',
                        outline: 'none'
                      }}
                    >
                      <option value="PENDING">Pending (Discovery ongoing)</option>
                      <option value="WON">Deal Won (Contract / Pilot)</option>
                      <option value="LOST">Deal Lost</option>
                      <option value="DEFERRED">Deferred / Nurturing</option>
                    </select>

                    <textarea
                      value={outcomeWhat}
                      onChange={e => setOutcomeWhat(e.target.value)}
                      placeholder="Record commercial outcome notes and terms..."
                      rows={3}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />

                    <button
                      onClick={handleUpdateOutcome}
                      disabled={updateOutcomeMutation.isPending || !outcomeWhat.trim()}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: outcomeWhat.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Record Outcome
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback Loop Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommendation Feedback
                </h3>

                {postData.feedback ? (
                  <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '13px', fontWeight: 600 }}>
                    ✓ Recommendation feedback captured for AI model reinforcement.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#64748B' }}>
                      Was this network introduction relevant?
                    </label>
                    <select
                      value={fbNetwork}
                      onChange={e => setFbNetwork(e.target.value as NetworkFeedback)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        background: '#FFFFFF'
                      }}
                    >
                      <option value="NETWORK_MATCH_STRONG">Strong &amp; Valuable Match</option>
                      <option value="NETWORK_MATCH_WEAK">Weak / Irrelevant Match</option>
                    </select>

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submitFeedbackMutation.isPending}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: '#F8FAFC',
                        color: '#334155',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Submit Learning Feedback
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Conversation Status Stepper & Note Capture */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Conversation Status Stepper (Screen 9 specification) */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Conversation Status Stepper
                  </h3>
                  <button
                    onClick={handleMarkMade}
                    style={{
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
                    Update Status
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Intro request sent', date: 'Jan 19', done: isIntroMade },
                    { label: `Accepted by ${personName}`, date: 'Jan 19', done: isIntroMade },
                    { label: 'Initial meeting scheduled', date: 'Jan 20', done: postData.conversations.length > 0 },
                    { label: 'Commercial follow-up & negotiation', date: 'In progress', done: postData.outcome !== null },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: step.done ? '#ECFDF5' : '#F8FAFC', border: `1px solid ${step.done ? '#A7F3D0' : '#E2E8F0'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: step.done ? '#047857' : '#CBD5E1',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: step.done ? 600 : 500, color: step.done ? '#065F46' : '#64748B' }}>
                          {step.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: step.done ? '#047857' : '#94A3B8', fontWeight: 500 }}>
                        {step.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation Notes Log */}
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
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Conversation Intelligence Log
                </h3>

                {postData.conversations.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                    <MessageSquare size={24} color="#94A3B8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                      No notes recorded yet. Log meeting notes, deal terms, or follow-up milestones below.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {postData.conversations.map(conv => (
                      <div key={conv.id} style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                            Milestone ({conv.status})
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {new Date(conv.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: '1.5' }}>
                          {conv.founderNotes}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <textarea
                    value={convNotes}
                    onChange={e => setConvNotes(e.target.value)}
                    placeholder="Log conversation notes, meeting outcomes, or next action items..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleAddConversation}
                      disabled={addConvMutation.isPending || !convNotes.trim()}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: convNotes.trim() ? '#2563EB' : '#E2E8F0',
                        color: convNotes.trim() ? '#FFFFFF' : '#94A3B8',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: convNotes.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {addConvMutation.isPending ? 'Saving...' : 'Record Notes'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
