import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity } from '../../../hooks/useOpportunities';
import { usePostIntroductionData, useMarkIntroductionMade, useAddConversation, useUpdateOutcome, useSubmitFeedback } from '../../../hooks/usePostIntroduction';
import type { IntroChannel, OutcomeType, NetworkFeedback } from '../../../services/api/postIntroduction.api';

export const PostIntroductionWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: opp, isLoading: isOppLoading } = useOpportunity(id || '');
  const { data: postData, isLoading: isPostLoading, isError } = usePostIntroductionData(id || '');
  
  const introMadeMutation = useMarkIntroductionMade(id || '');
  const addConvMutation = useAddConversation(id || '');
  const updateOutcomeMutation = useUpdateOutcome(id || '');
  const submitFeedbackMutation = useSubmitFeedback(id || '');

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
    addConvMutation.mutate({
      status: 'ACTIVE',
      founderNotes: convNotes,
      date: new Date().toISOString()
    });
    setConvNotes('');
  };

  const handleUpdateOutcome = () => {
    updateOutcomeMutation.mutate({
      outcomeType,
      whatHappened: outcomeWhat
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

  return (
    <WorkspaceShell
      title="Conversation, Deal & Outcome Intelligence"
      subtitle="Track the opportunity lifecycle from introduction through feedback."
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` },
        { label: 'Post Introduction', path: `/opportunities/${id}/post-introduction` }
      ]}
      isLoading={isOppLoading || isPostLoading}
      isError={isError}
      isEmpty={!isOppLoading && !isPostLoading && !postData}
      emptyStateMessage="No post-introduction data found for this opportunity."
    >
      {opp && postData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          
          <div style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Opportunity Context</h3>
            <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{opp.title}</p>
            <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>{opp.personName} · {opp.companyName}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            {/* Left Column: Flow actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              
              <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="card-title" style={{ margin: '0 0 var(--space-4) 0' }}>1. Introduction Execution</h3>
                {isIntroMade ? (
                  <div style={{ padding: 'var(--space-4)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)' }}>
                    <p className="body-text-important" style={{ margin: 0, color: 'var(--color-success)' }}>✓ Introduction Made</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <p className="body-text" style={{ margin: 0 }}>Did the founder explicitly make the introduction?</p>
                    <select value={introChannel} onChange={e => setIntroChannel(e.target.value as IntroChannel)} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <option value="EMAIL">Email</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="PHONE">Phone</option>
                    </select>
                    <button className="button-text" onClick={handleMarkMade} disabled={introMadeMutation.isPending} style={{ padding: 'var(--space-3)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                      Mark Introduction as Made
                    </button>
                  </div>
                )}
              </section>

              <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="card-title" style={{ margin: '0 0 var(--space-4) 0' }}>2. Conversation Intelligence</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {postData.conversations.length === 0 ? (
                    <p className="body-text text-secondary" style={{ margin: 0 }}>No conversations recorded yet.</p>
                  ) : (
                    postData.conversations.map(conv => (
                      <div key={conv.id} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                        <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>Conversation ({conv.status})</p>
                        <p className="body-text" style={{ margin: 0 }}>{conv.founderNotes}</p>
                      </div>
                    ))
                  )}
                  <textarea 
                    value={convNotes} 
                    onChange={e => setConvNotes(e.target.value)} 
                    placeholder="Capture conversation intelligence..."
                    style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} 
                  />
                  <button className="button-text" onClick={handleAddConversation} disabled={addConvMutation.isPending || !convNotes.trim()} style={{ padding: 'var(--space-3)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    Record Conversation
                  </button>
                </div>
              </section>

            </div>

            {/* Right Column: Outcome & Feedback */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              
              <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="card-title" style={{ margin: '0 0 var(--space-4) 0' }}>3. Outcome Intelligence</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {postData.outcome ? (
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>Current Outcome: {postData.outcome.outcomeType}</p>
                      <p className="body-text" style={{ margin: 0 }}>{postData.outcome.whatHappened}</p>
                    </div>
                  ) : (
                    <>
                      <select value={outcomeType} onChange={e => setOutcomeType(e.target.value as OutcomeType)} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                        <option value="PENDING">Pending</option>
                        <option value="WON">Won</option>
                        <option value="LOST">Lost</option>
                        <option value="DEFERRED">Deferred</option>
                      </select>
                      <textarea 
                        value={outcomeWhat} 
                        onChange={e => setOutcomeWhat(e.target.value)} 
                        placeholder="What happened? Why?"
                        style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} 
                      />
                      <button className="button-text" onClick={handleUpdateOutcome} disabled={updateOutcomeMutation.isPending || !outcomeWhat.trim()} style={{ padding: 'var(--space-3)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        Record Outcome
                      </button>
                    </>
                  )}
                </div>
              </section>

              <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h3 className="card-title" style={{ margin: '0 0 var(--space-4) 0' }}>4. Feedback Loop</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {postData.feedback ? (
                    <div style={{ padding: 'var(--space-4)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)' }}>
                      <p className="body-text-important" style={{ margin: 0, color: 'var(--color-success)' }}>✓ Feedback Captured</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <label className="body-text-important">Was the Network Match useful?</label>
                        <select value={fbNetwork} onChange={e => setFbNetwork(e.target.value as NetworkFeedback)} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                          <option value="NETWORK_MATCH_STRONG">Strong Match</option>
                          <option value="NETWORK_MATCH_WEAK">Weak Match</option>
                        </select>
                      </div>
                      <button className="button-text" onClick={handleSubmitFeedback} disabled={submitFeedbackMutation.isPending} style={{ padding: 'var(--space-3)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        Submit Feedback Loop
                      </button>
                    </>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
