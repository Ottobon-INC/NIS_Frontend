import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity, useValidateOpportunity } from '../../../hooks/useOpportunities';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';

export const OpportunityDetailWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  
  const { data: opp, isLoading, isError } = useOpportunity(id || '');
  const validateMutation = useValidateOpportunity(id || '');

  if (!id) return <div>Invalid Opportunity ID</div>;

  return (
    <WorkspaceShell
      title={opp?.title || 'Opportunity Detail'}
      subtitle={opp ? `${opp.personName} · ${opp.companyName}` : ''}
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && !opp}
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
            {opp.status === 'CANDIDATE' && (
              <div style={{ padding: 'var(--space-4)', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)' }}>
                <p className="body-text-important" style={{ margin: 0, color: '#92400e' }}>
                  <strong>System-Suggested Opportunity:</strong> This opportunity was generated from Trusted Context and requires Founder Validation before it can proceed to Matching.
                </p>
              </div>
            )}

            {/* Why This Opportunity Exists */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-6) 0', textTransform: 'uppercase' }}>Why This Opportunity Exists</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div>
                  <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Underlying Problem</h3>
                  <p className="body-text" style={{ margin: 0 }}>{opp.problem}</p>
                </div>
                
                <div>
                  <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Explicit Requirement</h3>
                  <p className="body-text" style={{ margin: 0 }}>{opp.requirement}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Timeline</h3>
                    <p className="body-text" style={{ margin: 0, color: opp.timeline ? 'inherit' : 'var(--color-text-secondary)' }}>
                      {opp.timeline || 'Timeline signal not available.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Budget Signal</h3>
                    <p className="body-text" style={{ margin: 0, color: opp.budgetSignal ? 'inherit' : 'var(--color-text-secondary)' }}>
                      {opp.budgetSignal || 'Budget signal not available.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Trusted Context Provenance */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 className="section-title" style={{ margin: 0, textTransform: 'uppercase' }}>Trusted Context</h2>
                <button 
                  className="button-text"
                  onClick={() => navigate(`/people/${opp.personId}/context`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                >
                  View Full Contact Context
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {opp.trustedContextIds.map(tcId => (
                  <div key={tcId} style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-brand-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <TrustBadge level="CONFIRMED" />
                      <span className="metadata text-secondary">ID: {tcId}</span>
                    </div>
                    <p className="body-text" style={{ margin: 0 }}>
                      This opportunity was directly derived from founder-approved intelligence (Trusted Context).
                    </p>
                  </div>
                ))}
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

            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Source & Origin</h3>
              
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <p className="body-text-important" style={{ margin: '0 0 var(--space-1) 0' }}>{opp.personName}</p>
                <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>{opp.companyName}</p>
                <button 
                  className="button-text"
                  onClick={() => navigate(`/people/${opp.personId}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                >
                  View Contact 360 &rarr;
                </button>
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

            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Evidence Trace</h3>
              <p style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Opportunity Confidence: <strong>{opp.confidence}%</strong>
              </p>
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
