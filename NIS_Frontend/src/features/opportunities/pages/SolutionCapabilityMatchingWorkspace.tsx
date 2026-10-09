import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity } from '../../../hooks/useOpportunities';
import { useCapabilityMatches, useUpdateMatchStatus } from '../../../hooks/useCapabilityMatching';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import type { MatchAlignment, CapabilityMatchStatus } from '../../../services/api/capabilities.api';

const AlignmentIndicator: React.FC<{ label: string; value: MatchAlignment }> = ({ label, value }) => {
  const getColor = () => {
    switch (value) {
      case 'STRONG': return 'var(--color-success)';
      case 'MODERATE': return '#f59e0b';
      case 'WEAK': return '#ef4444';
      case 'NONE': return 'var(--color-text-secondary)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="metadata text-secondary">{label}</span>
      <span className="metadata" style={{ color: getColor() }}>{value}</span>
    </div>
  );
};

export const SolutionCapabilityMatchingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  
  const { data: opp, isLoading: isOppLoading } = useOpportunity(id || '');
  const { data: matchesData, isLoading: isMatchesLoading, isError } = useCapabilityMatches(id || '');
  const updateMatchMutation = useUpdateMatchStatus(id || '');

  if (!id) return <div>Invalid Opportunity ID</div>;

  const handleStatusChange = (matchId: string, status: CapabilityMatchStatus) => {
    updateMatchMutation.mutate({ matchId, status });
  };

  const hasSelected = matchesData?.matches.some(m => m.status === 'SELECTED');

  return (
    <WorkspaceShell
      title="Solution & Capability Matching"
      subtitle={opp ? `${opp.title} · ${opp.companyName}` : ''}
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` },
        { label: 'Capability Matching', path: `/opportunities/${id}/matching` }
      ]}
      isLoading={isOppLoading || isMatchesLoading}
      isError={isError}
      isEmpty={!isOppLoading && !isMatchesLoading && (!matchesData?.matches || matchesData.matches.length === 0)}
      emptyStateMessage="No sufficiently supported capability match found."
      primaryAction={
        hasSelected ? {
          label: 'Proceed to Network Matching',
          onClick: () => navigate(`/opportunities/${id}/network-matching`),
          disabled: false
        } : undefined
      }
    >
      {opp && matchesData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          
          {/* Opportunity Context Header */}
          <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            <div>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Client Problem</h3>
              <p className="body-text" style={{ margin: 0 }}>{opp.problem}</p>
            </div>
            <div>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Client Requirement</h3>
              <p className="body-text" style={{ margin: 0 }}>{opp.requirement}</p>
            </div>
          </section>

          {/* Matches List */}
          <div>
            <h2 className="section-title" style={{ margin: '0 0 var(--space-6) 0' }}>Potential Capability Matches</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {matchesData.matches.map(match => (
                <div key={match.id} style={{ background: match.status === 'SELECTED' ? '#f0fdf4' : '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: `1px solid ${match.status === 'SELECTED' ? '#bbf7d0' : 'var(--color-border)'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
                  
                  {/* Left Column: Capability Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>{match.capability.name}</h3>
                        <span className="labels" style={{ color: 'var(--color-brand-primary)', background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                          {match.capability.category}
                        </span>
                      </div>
                      <p className="body-text" style={{ margin: 0 }}>{match.capability.description}</p>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Why This Capability?</h4>
                      <p className="body-text" style={{ margin: 0 }}>{match.reasoning.overallExplanation}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <TrustBadge level="INFERENCE" />
                        <span className="metadata text-secondary">Confidence: {match.confidence}%</span>
                      </div>
                      <button 
                        className="button-text"
                        onClick={() => openEvidenceDrawer(match.evidenceIds[0], 'INFERENCE', match.capability.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                      >
                        View Supporting Evidence
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Alignment & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', borderLeft: '1px solid var(--color-border)', paddingLeft: 'var(--space-7)' }}>
                    <div>
                      <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Alignment Signals</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <AlignmentIndicator label="Problem Alignment" value={match.reasoning.problemAlignment} />
                        <AlignmentIndicator label="Requirement Alignment" value={match.reasoning.requirementAlignment} />
                        <AlignmentIndicator label="Technology Alignment" value={match.reasoning.technologyAlignment} />
                        <AlignmentIndicator label="Industry Alignment" value={match.reasoning.industryAlignment} />
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)', marginTop: 'auto' }}>
                      {match.status === 'SELECTED' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                          <div>
                            <p className="body-text-important" style={{ margin: '0 0 var(--space-1) 0', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              <span>✓</span> CAPABILITY SELECTED
                            </p>
                            <p className="body-text text-secondary" style={{ margin: 0 }}>
                              The founder has selected this capability as a potential solution for the validated opportunity.
                            </p>
                          </div>
                          <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                            <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Next Stage</span>
                            <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>Network Matching</p>
                            <button 
                              className="button-text"
                              onClick={() => navigate(`/opportunities/${id}/network-matching`)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                            >
                              Enter Network Matching Workspace &rarr;
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Founder Review</h4>
                          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                            <button 
                              className="button-text"
                              onClick={() => handleStatusChange(match.id, 'SELECTED')}
                              disabled={updateMatchMutation.isPending}
                              style={{ flex: 1, padding: 'var(--space-3)', background: '#fff', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                              Select Match
                            </button>
                            <button 
                              className="button-text"
                              onClick={() => handleStatusChange(match.id, 'REJECTED')}
                              disabled={updateMatchMutation.isPending || match.status === 'REJECTED'}
                              style={{ flex: 1, padding: 'var(--space-3)', background: match.status === 'REJECTED' ? '#fee2e2' : '#fff', color: match.status === 'REJECTED' ? '#b91c1c' : 'var(--color-text-primary)', border: `1px solid ${match.status === 'REJECTED' ? '#fca5a5' : 'var(--color-border)'}`, borderRadius: 'var(--radius-sm)', cursor: match.status === 'REJECTED' ? 'default' : 'pointer' }}
                            >
                              {match.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
