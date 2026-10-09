import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunities } from '../../../hooks/useOpportunities';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';

export const OpportunityWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOpportunities();

  return (
    <WorkspaceShell
      title="Opportunity Intelligence"
      subtitle="Identify, review, and define business opportunities derived from trusted context."
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!data?.opportunities || data.opportunities.length === 0)}
      emptyStateMessage="No opportunities detected. Establish more Trusted Context."
    >
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
          {data.opportunities.map(opp => (
            <div 
              key={opp.id} 
              onClick={() => navigate(`/opportunities/${opp.id}`)}
              style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="card-title" style={{ margin: '0 0 var(--space-1) 0' }}>{opp.title}</h3>
                  <p className="body-text text-secondary" style={{ margin: 0 }}>{opp.personName} · {opp.companyName}</p>
                </div>
                {opp.status === 'CANDIDATE' ? (
                  <span className="labels" style={{ color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>REVIEW PENDING</span>
                ) : (
                  <span className="labels" style={{ color: 'var(--color-success)', background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>VALIDATED</span>
                )}
              </div>

              <div>
                <p className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Need / Problem</p>
                <p className="body-text" style={{ margin: 0 }}>{opp.problem}</p>
              </div>

              <div>
                <p className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Requirement</p>
                <p className="body-text" style={{ margin: 0 }}>{opp.requirement}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <TrustBadge level={opp.status === 'VALIDATED' ? 'CONFIRMED' : 'INFERENCE'} />
                  <span className="metadata text-secondary">Confidence {opp.confidence}%</span>
                </div>
                <div className="metadata text-secondary">
                  {new Date(opp.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
};
