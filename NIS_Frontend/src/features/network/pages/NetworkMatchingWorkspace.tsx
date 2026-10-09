import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity } from '../../../hooks/useOpportunities';
import { useNetworkMatches, useUpdateNetworkMatchStatus } from '../../../hooks/useNetworkMatching';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import type { MatchDimensionLevel, NetworkMatchStatus, NetworkMatch } from '../../../services/api/networkMatching.api';

const DimensionIndicator: React.FC<{ label: string; value: MatchDimensionLevel | string }> = ({ label, value }) => {
  const getColor = () => {
    switch (value) {
      case 'STRONG':
      case 'AVAILABLE': return 'var(--color-success)';
      case 'MODERATE':
      case 'LIMITED': return '#f59e0b';
      case 'WEAK': return '#ef4444';
      case 'UNKNOWN': return 'var(--color-text-secondary)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="labels text-secondary">{label}</span>
      <span className="metadata" style={{ color: getColor() }}>{value}</span>
    </div>
  );
};

export const NetworkMatchingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  
  const { data: opp, isLoading: isOppLoading } = useOpportunity(id || '');
  const { data: networkData, isLoading: isMatchesLoading, isError } = useNetworkMatches(id || '');
  const updateMatchMutation = useUpdateNetworkMatchStatus(id || '');

  if (!id) return <div>Invalid Opportunity ID</div>;

  const handleStatusChange = (matchId: string, status: NetworkMatchStatus) => {
    updateMatchMutation.mutate({ matchId, status });
  };

  const hasSelected = networkData?.matches.some(m => m.status === 'SELECTED');

  const renderCandidateCard = (match: NetworkMatch) => (
    <div key={match.id} style={{ background: match.status === 'SELECTED' ? '#f0fdf4' : '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: `1px solid ${match.status === 'SELECTED' ? '#bbf7d0' : 'var(--color-border)'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
      
      {/* Left Column: Candidate Details & Reasoning */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <h3 className="card-title" style={{ margin: 0 }}>{match.candidateName}</h3>
            <span className="labels" style={{ color: 'var(--color-brand-primary)', background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
              {match.matchType}
            </span>
          </div>
          <p className="body-text text-secondary" style={{ margin: 0 }}>{match.candidateTitle} · {match.candidateCompany}</p>
        </div>

        <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Why This Match?</h4>
          <p className="body-text" style={{ margin: 0 }}>{match.reasoning}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <TrustBadge level="INFERENCE" />
            <span className="metadata text-secondary">Confidence: {match.confidence}%</span>
          </div>
          <button 
            className="button-text"
            onClick={() => openEvidenceDrawer(match.evidenceIds[0], 'INFERENCE', match.candidateName)}
            style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
          >
            View Supporting Evidence
          </button>
        </div>
      </div>

      {/* Right Column: Dimensions & Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', borderLeft: '1px solid var(--color-border)', paddingLeft: 'var(--space-7)' }}>
        <div>
          <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Match Dimensions</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <DimensionIndicator label="Relevance" value={match.dimensions.relevance} />
            <DimensionIndicator label="Expertise" value={match.dimensions.expertise} />
            <DimensionIndicator label="Relationship" value={match.dimensions.relationshipStrength} />
            <DimensionIndicator label="Industry Fit" value={match.dimensions.industryFit} />
            <DimensionIndicator label="Geography" value={match.dimensions.geography} />
            <DimensionIndicator label="Availability" value={match.dimensions.availability} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)', marginTop: 'auto' }}>
          {match.status === 'SELECTED' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <p className="body-text-important" style={{ margin: '0 0 var(--space-1) 0', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>✓</span> NETWORK MATCH SELECTED
                </p>
                <p className="body-text text-secondary" style={{ margin: 0 }}>
                  The founder has selected this person/network candidate for the validated opportunity.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Next Stage</span>
                <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>Founder Introduction</p>
                <button 
                  className="button-text"
                  onClick={() => navigate(`/opportunities/${id}/introduction`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                >
                  Enter Introduction Workspace &rarr;
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Founder Attention</h4>
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
  );

  return (
    <WorkspaceShell
      title="Network Matching Intelligence"
      subtitle="Identify who in our internal organization or broader network can help deliver the selected capability."
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` },
        { label: 'Capability Matching', path: `/opportunities/${id}/matching` },
        { label: 'Network Matching', path: `/opportunities/${id}/network-matching` }
      ]}
      isLoading={isOppLoading || isMatchesLoading}
      isError={isError}
      isEmpty={!isOppLoading && !isMatchesLoading && (!networkData?.matches || networkData.matches.length === 0)}
      emptyStateMessage="No sufficiently supported network match found."
      primaryAction={
        hasSelected ? {
          label: 'Proceed to Founder Introduction',
          onClick: () => navigate(`/opportunities/${id}/introduction`),
          disabled: false
        } : undefined
      }
    >
      {opp && networkData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          
          {/* Top Context Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <h3 className="labels text-secondary" style={{ margin: 0 }}>Opportunity Context</h3>
                <button 
                  className="button-text"
                  onClick={() => navigate(`/people/${opp.personId}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                >
                  View Person &rarr;
                </button>
              </div>
              <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{opp.title}</p>
              <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>{opp.personName} · {opp.companyName}</p>
              <p className="body-text text-secondary" style={{ margin: 0, fontStyle: 'italic' }}>"{opp.requirement}"</p>
            </section>
            
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Selected Capability</h3>
              <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{networkData.selectedCapability?.name}</p>
              <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>{networkData.selectedCapability?.category}</p>
              <p className="body-text" style={{ margin: 0 }}>{networkData.selectedCapability?.description}</p>
            </section>
          </div>

          {/* Network Matches Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>
            
            {/* INTERNAL MATCHES */}
            {networkData.matches.some(m => m.matchType === 'INTERNAL') && (
              <div>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0', borderBottom: '2px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>INTERNAL MATCHES</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {networkData.matches.filter(m => m.matchType === 'INTERNAL').map(renderCandidateCard)}
                </div>
              </div>
            )}

            {/* NETWORK MATCHES */}
            {networkData.matches.some(m => m.matchType === 'NETWORK') && (
              <div>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0', borderBottom: '2px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>NETWORK MATCHES</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {networkData.matches.filter(m => m.matchType === 'NETWORK').map(renderCandidateCard)}
                </div>
              </div>
            )}

            {/* HYBRID MATCHES */}
            {networkData.matches.some(m => m.matchType === 'HYBRID') && (
              <div>
                <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0', borderBottom: '2px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>HYBRID MATCHES</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {networkData.matches.filter(m => m.matchType === 'HYBRID').map(renderCandidateCard)}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
