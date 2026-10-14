import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContact360 } from '../../../hooks/useContact360';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import { contactsApi } from '../../../services/api/contacts.api';
import { SemanticProductMatchCard } from '../components/SemanticProductMatchCard';

export const Contact360Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openEvidenceDrawer } = useUIStore();
  const { data: contact, isLoading, isError } = useContact360(id || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id || !contact) return;
    if (window.confirm(`Are you sure you want to delete "${contact.name}"? This action cannot be undone.`)) {
      try {
        setIsDeleting(true);
        await contactsApi.delete(id);
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['deleted-contacts'] });
        navigate('/people');
      } catch (err: any) {
        alert(`Failed to delete contact: ${err.message || 'Unknown error'}`);
        setIsDeleting(false);
      }
    }
  };

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
      {contact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          {/* 1. Commercial Intelligence Provenance Banner */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Status:</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', background: '#F5F3FF', padding: '3px 8px', borderRadius: '4px' }}>
                    {contact.commercialIntelligence.pipelineStage || 'QUALIFIED'} (Awaiting Founder Outreach Approval)
                  </span>
                </div>
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
                    Verified Channels ({contact.commercialIntelligence.sourcesUsed.length}):
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

          {/* 2. Semantic Product & Solution Matching Card */}
          <SemanticProductMatchCard
            contactId={contact?.id || id}
            contactName={contact.name}
            contactCompany={contact.company}
            contactTitle={contact.title}
            defaultProblem={contact.commercialIntelligence?.broadBusinessProblem || contact.commercialIntelligence?.smallestSolvableProblem || ''}
          />

          {/* 3. Person Intelligence & Company Intelligence */}
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
                  {contact.personIntelligence.expertise && contact.personIntelligence.expertise.length > 0 && (
                    <div>
                      <span className="labels text-secondary" style={{ display: 'block', marginBottom: '6px' }}>Core Technical Expertise</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {contact.personIntelligence.expertise.map((tag, i) => (
                          <span key={i} style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            background: '#F1F5F9',
                            color: '#334155',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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

          {/* 4. How They Help Us & How We Help Them */}
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

          {/* 5. Signals & Relationship Engine */}
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
                                  <span className="body-text-important">Founder &rarr; {contact.name}</span>
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

          {/* 6. Cumulative Intelligence (What We Knew Before & What We Learned) */}
          {(contact.whatWeKnewBefore || contact.whatWeLearned) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
              {/* What We Knew Before */}
              <section style={{ padding: 'var(--space-6)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h2 className="section-title" style={{ margin: 0 }}>What We Knew Before</h2>
                  <span className="labels text-secondary">Verified Baseline</span>
                </div>
                {contact.whatWeKnewBefore ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <span className="labels text-secondary">Verified Person Background</span>
                      <p className="body-text text-secondary" style={{ margin: 'var(--space-1) 0 0 0', fontStyle: 'italic' }}>
                        "{contact.whatWeKnewBefore.personBackground}"
                      </p>
                    </div>
                    <div>
                      <span className="labels text-secondary">Company Operational Context</span>
                      <p className="body-text text-secondary" style={{ margin: 'var(--space-1) 0 0 0', fontStyle: 'italic' }}>
                        "{contact.whatWeKnewBefore.companyContext}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No baseline data recorded.</p>
                )}
              </section>

              {/* What We Learned */}
              <section style={{ padding: 'var(--space-6)', background: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h2 className="section-title" style={{ margin: 0 }}>What We Learned</h2>
                  <span className="labels" style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
                    Extracted Intelligence
                  </span>
                </div>
                {contact.whatWeLearned ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {contact.whatWeLearned.insights && contact.whatWeLearned.insights.length > 0 && (
                      <div>
                        <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Key Strategic Insights</span>
                        <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {contact.whatWeLearned.insights.map((insight, idx) => (
                            <li key={idx} className="body-text">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>No additional insights captured yet.</p>
                )}
              </section>
            </div>
          )}

          {/* 7. Full Markdown Intelligence Dossier */}
          {contact.full_markdown_report && (
            <section style={{ padding: 'var(--space-8)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>Full Commercial Opportunity Brief</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Verified Snapshot</span>
              </div>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{contact.full_markdown_report}</ReactMarkdown>
              </div>
            </section>
          )}
        </div>
      )}
    </WorkspaceShell>
  );
};
