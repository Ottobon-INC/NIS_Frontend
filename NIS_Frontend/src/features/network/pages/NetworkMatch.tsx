import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingApi } from '../../../services/api/matching.api';
import { useUIStore } from '../../../store/uiStore';

export const NetworkMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openEvidenceDrawer } = useUIStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['networkMatch', id],
    queryFn: () => matchingApi.getMatchDetail(id!)
  });

  const approveMutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'REJECT') => matchingApi.approveMatch(id!, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['networkMatch', id] });
      if (variables === 'APPROVE') {
        navigate(`/messages/${id}/review`);
      }
    }
  });

  if (isLoading) return <p>Loading match details...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Failed to load match details.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-7)' }}>
        <span className="labels text-secondary">Network Match Evaluation</span>
        <h1 className="page-title" style={{ marginTop: 'var(--space-1)' }}>{data.candidateName}</h1>
        <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>{data.candidateCompany}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-7)' }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
          <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Match Score</p>
          <p className="section-title" style={{ color: 'var(--color-brand-primary)' }}>{data.matchScore}%</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
          <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Relationship</p>
          <p className="body-text-important">{data.relationshipStrength}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
          <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Capability Fit</p>
          <p className="body-text-important">{data.capabilityFit}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
          <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Strategic Relevance</p>
          <p className="body-text-important">{data.strategicRelevance}</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-7)', marginBottom: 'var(--space-7)' }}>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-6)' }}>Why This Match?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {data.reasons.map((reason, index) => (
            <div key={index} style={{ paddingLeft: 'var(--space-4)', borderLeft: '3px solid var(--color-brand-primary)' }}>
              <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{reason.title}</h3>
              <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-2)' }}>{reason.description}</p>
              {reason.evidenceId && (
                <button 
                  className="button-text"
                  onClick={() => openEvidenceDrawer(reason.evidenceId!, 'FACT', reason.title)}
                  style={{ color: 'var(--color-brand-primary)', padding: 0 }}
                >
                  View Evidence &rarr;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {data.status === 'REVIEW_REQUIRED' ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-7)' }}>
          <button 
            className="button-text"
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate('REJECT')}
            style={{ padding: 'var(--space-3) var(--space-7)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer' }}
          >
            Dismiss Match
          </button>
          <button 
            className="button-text"
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate('APPROVE')}
            style={{ padding: 'var(--space-3) var(--space-7)', background: 'var(--color-brand-primary)', color: '#fff', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            Approve & Propose Intro
          </button>
        </div>
      ) : (
        <div className="body-text-important" style={{ textAlign: 'right', color: data.status === 'FOUNDER_APPROVED' ? 'var(--color-success)' : 'var(--color-error)' }}>
          Status: {data.status.replace('_', ' ')}
        </div>
      )}
    </div>
  );
};
