import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { opportunitiesApi } from '../../../services/api/opportunities.api';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';

export const SolutionMatching = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['solutions', id],
    queryFn: () => opportunitiesApi.getSolutions(id!)
  });

  const pathMutation = useMutation({
    mutationFn: (path: string) => opportunitiesApi.setPath(id!, path),
    onSuccess: () => navigate('/opportunities/board')
  });

  if (isLoading) return <p>Loading matching solutions...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Failed to load matching solutions.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-7)' }}>
        <span className="labels text-secondary">Opportunity Engine</span>
        <h1 className="page-title" style={{ marginTop: 'var(--space-1)' }}>Solution Matching</h1>
        <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>NetworkOS has analyzed the validated needs against your capabilities and network.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-7)' }}>
        {data.solutions.map(sol => (
          <div key={sol.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <span className="labels" style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-primary)', marginRight: 'var(--space-2)' }}>{sol.type}</span>
                <span className="metadata text-secondary" style={{ }}>Match Score: {sol.matchScore}%</span>
              </div>
              <TrustBadge level={sol.trustLevel} />
            </div>
            
            <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{sol.name}</h3>
            <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-6)' }}>{sol.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {sol.evidenceId ? (
                <button 
                  className="button-text"
                  onClick={() => openEvidenceDrawer(sol.evidenceId!, 'INFERENCE', sol.name)}
                  style={{ color: 'var(--color-brand-primary)', padding: 0 }}
                >
                  View Evidence
                </button>
              ) : (
                <span />
              )}
              <button 
                className="button-text"
                disabled={pathMutation.isPending}
                onClick={() => pathMutation.mutate(sol.type)}
                style={{ padding: 'var(--space-2) var(--space-4)', background: '#fff', border: '1px solid var(--color-brand-primary)', color: 'var(--color-brand-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Select Path
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
