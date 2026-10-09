import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contactsApi } from '../../../services/api/contacts.api';

export const IdentifyPerson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ['identify', id],
    queryFn: () => contactsApi.getIdentify(id!)
  });

  const confirmMutation = useMutation({
    mutationFn: () => contactsApi.confirmIdentify(id!),
    onSuccess: () => navigate(`/contacts/${id}`)
  });

  if (isLoading) return <p>Loading identity data...</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'var(--space-7) auto' }}>
      <h2 className="page-title" style={{ marginBottom: 'var(--space-2)' }}>Identify Person</h2>
      <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-7)' }}>Please confirm the AI extracted identity before we finalize the Contact 360 profile.</p>
      
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-7)', paddingBottom: 'var(--space-7)', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>{data.name}</h1>
            <p className="body-text text-secondary">{data.title} at {data.company}</p>
            <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>{data.location}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="labels" style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--color-bg-primary)', borderRadius: '16px' }}>
              AI Confidence: {data.confidence}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
          <button style={{ padding: 'var(--space-3) var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
            Reject / Correct
          </button>
          <button 
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
            className="button-text"
            style={{ padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand-primary)', color: '#fff', borderRadius: 'var(--radius-sm)' }}
          >
            {confirmMutation.isPending ? 'Confirming...' : 'Confirm Identity'}
          </button>
        </div>
      </div>
    </div>
  );
};
