import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContact360 } from '../../../hooks/useContact360';
import { useFounderDecisions } from '../../../hooks/useFounderDecisions';
import { FounderDecisionQueue } from '../../../components/intelligence/FounderDecisionQueue';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import type { DecisionItem } from '../../../components/intelligence/FounderDecisionQueue';

export const IntelligenceTranscriptWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();

  const { data: contact, isLoading: isContactLoading, isError: isContactError } = useContact360(id || '');
  const { data: allDecisions, isLoading: isDecisionsLoading } = useFounderDecisions();

  // Filter decisions just for this person
  const personDecisions = useMemo(() => {
    if (!allDecisions || !id) return [];
    return allDecisions.filter(d => d.personId === id);
  }, [allDecisions, id]);

  const handleDecisionAction = (item: DecisionItem) => {
    if (item.type === 'VALIDATION_REQUIRED') {
      navigate(`/opportunities/${item.opportunityId || '123'}`);
    } else if (item.type === 'MATCH_REVIEW_REQUIRED') {
      navigate(`/network/matches/${item.id}`);
    }
  };

  const isLoading = isContactLoading || isDecisionsLoading;

  if (!id) return <div>Invalid Contact ID</div>;

  return (
    <WorkspaceShell
      title="Executive Summary"
      subtitle={contact ? `${contact.name} · ${contact.company}` : ''}
      breadcrumbs={[
        { label: 'People', path: '/people' },
        { label: contact?.name || 'Contact 360', path: `/people/${id}` },
        { label: 'Executive Summary', path: `/people/${id}/transcript` }
      ]}
      primaryAction={{ label: 'Prepare Meeting', onClick: () => navigate(`/meetings/${id}/brief`) }}
      isLoading={isLoading}
      isError={isContactError}
      isEmpty={false}
    >
      {contact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>
          
          {/* 1. FOUNDER ATTENTION */}
          {personDecisions.length > 0 && (
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-brand-primary)' }}>
              <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ margin: 0, color: 'var(--color-brand-primary)' }}>Founder Attention Required</h2>
                <span className="labels" style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
                  {personDecisions.length} Items
                </span>
              </div>
              <FounderDecisionQueue items={personDecisions} onDecisionAction={handleDecisionAction} />
            </section>
          )}

          {/* 2. CURRENT UNDERSTANDING */}
          <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Current Understanding (Trusted Context)</h2>
            {contact.currentTrustedContext && contact.currentTrustedContext.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {contact.currentTrustedContext.map((item, idx) => (
                  <li key={idx} className="body-text">{item}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No trusted context available.</p>
            )}
          </section>

          {/* 3 & 4. PERSON & COMPANY INTELLIGENCE (CURRENT) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Person Intelligence</h2>
              {contact.personIntelligence ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <span className="labels text-secondary">Background & Context</span>
                    <p className="body-text" style={{ margin: 'var(--space-1) 0 0 0' }}>{contact.personIntelligence.background}</p>
                  </div>
                  <div>
                    <span className="labels text-secondary">Decision Influence</span>
                    <p className="body-text" style={{ margin: 'var(--space-1) 0 0 0' }}>{contact.personIntelligence.decisionInfluence}</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Person intelligence is not available yet.</p>
              )}
            </section>

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

          {/* 5. WHAT WE KNEW BEFORE */}
          <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>What We Knew Before</h2>
              <span className="labels text-secondary">External Research</span>
            </div>
            {contact.whatWeKnewBefore ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <span className="labels text-secondary">Initial Person Background</span>
                  <p className="body-text text-secondary" style={{ margin: 'var(--space-1) 0 0 0', fontStyle: 'italic' }}>"{contact.whatWeKnewBefore.personBackground}"</p>
                </div>
                <div>
                  <span className="labels text-secondary">Initial Company Context</span>
                  <p className="body-text text-secondary" style={{ margin: 'var(--space-1) 0 0 0', fontStyle: 'italic' }}>"{contact.whatWeKnewBefore.companyContext}"</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No pre-conversation intelligence recorded.</p>
            )}
          </section>

          {/* 6. WHAT WE LEARNED (FOUNDER INPUT) */}
          <section style={{ padding: 'var(--space-6)', background: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>What We Learned</h2>
              <span className="labels" style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)' }}>Founder / Conversation Intelligence</span>
            </div>
            
            {contact.whatWeLearned ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
                {/* Extracted Insights */}
                <div>
                  <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Extracted Candidate Insights</span>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {contact.whatWeLearned.insights.map((insight, idx) => (
                      <li key={idx} className="body-text">{insight}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Raw Input Preservation */}
                {contact.whatWeLearned.rawInputs && contact.whatWeLearned.rawInputs.length > 0 && (
                  <div>
                    <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Raw Founder Input / Transcripts</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      {contact.whatWeLearned.rawInputs.map((input) => (
                        <div key={input.id} style={{ padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                            <span className="metadata">{input.sourceType.replace('_', ' ')}</span>
                            <span className="metadata text-secondary">{new Date(input.date).toLocaleDateString()}</span>
                          </div>
                          <p className="body-text text-secondary" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{input.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No founder inputs or conversation transcripts recorded yet.</p>
            )}
          </section>

          {/* 6.5 RELATIONSHIP & HYPOTHESES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Relationship Intelligence</h2>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
              <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>How They Help Us</h2>
                {contact.howTheyHelpUs && contact.howTheyHelpUs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {contact.howTheyHelpUs.map((item, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
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

              <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>How We Help Them</h2>
                {contact.howWeHelpThem && contact.howWeHelpThem.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {contact.howWeHelpThem.map((item, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                          <span className="body-text-important">{item.need}</span>
                          <TrustBadge level={item.level} />
                        </div>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Potential fit: {item.capability}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No capability match hypothesis currently exists.</p>
                )}
              </section>
            </div>
          </div>

          {/* 6.75 CURRENT CONTEXT / OPPORTUNITIES */}
          <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Active Opportunities & Context</h2>
            {contact.currentContext ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
                <div>
                  <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Active Pipeline</span>
                  {contact.currentContext.activeOpportunities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      {contact.currentContext.activeOpportunities.map((o, i) => (
                        <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                          <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{o}</p>
                          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
                            <button 
                              className="button-text"
                              onClick={() => navigate(`/opportunities/opp-1`)} 
                              style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                            >
                              View Opportunity &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>No active pipelines.</p>
                  )}
                </div>
                <div>
                  <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Recent Meetings</span>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {contact.currentContext.recentMeetings.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No active context.</p>
            )}
          </section>

          {/* 7. SIGNALS */}
          <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Recent Signals</h2>
            {contact.signals && contact.signals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {contact.signals.map(sig => (
                  <div key={sig.id} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-brand-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <span className="body-text-important">{sig.title}</span>
                      <TrustBadge level={sig.level} />
                    </div>
                    <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-sm)' }}>{sig.description}</p>
                    <p style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}><strong>Why it matters:</strong> {sig.whyItMatters}</p>
                    {sig.evidenceId && (
                      <button 
                        className="button-text"
                        onClick={() => openEvidenceDrawer(sig.evidenceId!, sig.level, sig.title)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                      >
                        View Evidence &rarr;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No significant signals detected.</p>
            )}
          </section>

          {/* 8. EVIDENCE & SOURCES */}
          <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Evidence & Sources</h2>
            {contact.evidenceList && contact.evidenceList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {contact.evidenceList.map((evidence) => (
                  <div key={evidence.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <span className="body-text-important" style={{ display: 'block' }}>{evidence.title}</span>
                      <span className="labels text-secondary">{evidence.type.replace('_', ' ')}</span>
                    </div>
                    <span className="metadata text-secondary">{evidence.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No evidence or sources recorded.</p>
            )}
          </section>

          {/* 9. INTELLIGENCE HISTORY */}
          <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Intelligence History</h2>
            {contact.intelligenceHistory && contact.intelligenceHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {contact.intelligenceHistory.map((historyItem) => (
                  <div key={historyItem.id} style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                    <div style={{ width: '120px', flexShrink: 0 }}>
                      <span className="metadata text-secondary">{new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><br />
                      <span className="metadata text-secondary">{new Date(historyItem.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="labels" style={{ display: 'inline-block', marginBottom: 'var(--space-1)', padding: '0.125rem 0.375rem', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                        {historyItem.sourceType.replace('_', ' ')}
                      </span>
                      <p className="body-text" style={{ margin: 0 }}>{historyItem.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No chronological history available.</p>
            )}
          </section>

        </div>
      )}
    </WorkspaceShell>
  );
};
