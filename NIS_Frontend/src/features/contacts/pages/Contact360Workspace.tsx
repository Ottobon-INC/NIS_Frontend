import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContact360 } from '../../../hooks/useContact360';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';

export const Contact360Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  const { data: contact, isLoading, isError } = useContact360(id || '');

  if (!id) return <div>Invalid Contact ID</div>;

  return (
    <WorkspaceShell
      title={contact ? `${contact.name}` : 'Loading...'}
      subtitle={contact ? `${contact.title} · ${contact.company}` : ''}
      breadcrumbs={[{ label: 'People', path: '/people' }, { label: contact?.name || 'Contact 360', path: `/people/${id}` }]}
      primaryAction={{ label: 'Prepare Meeting', onClick: () => navigate(`/meetings/${id}/brief`) }}
      secondaryActions={[{ label: 'Executive Summary', onClick: () => navigate(`/people/${id}/transcript`), variant: 'primary' }]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={false}
    >
      {contact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          
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
                            onClick={() => openEvidenceDrawer(sig.evidenceId!, sig.level, sig.title)}
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
    </WorkspaceShell>
  );
};
