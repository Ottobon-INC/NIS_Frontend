import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { contactsApi } from '../../../services/api/contacts.api';

export const AddContact = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);

  const createMutation = useMutation<{ id: string; status: string }, Error, { linkedinUrl: string }>({
    mutationFn: contactsApi.create,
    onSuccess: (data) => {
      setJobId(data.id);
    }
  });

  const { data: statusData } = useQuery({
    queryKey: ['contactStatus', jobId],
    queryFn: () => contactsApi.getStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => query.state.data?.status === 'COMPLETED' ? false : 1000
  });

  useEffect(() => {
    if (statusData?.status === 'COMPLETED') {
      navigate(`/contacts/${jobId}/identify`);
    }
  }, [statusData, navigate, jobId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) createMutation.mutate({ linkedinUrl: url });
  };

  if (jobId) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Researching Contact</h2>
        <div style={{ marginTop: 'var(--space-7)', padding: 'var(--space-7)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <p>✓ Initiating profile resolution...</p>
            <p>✓ Connecting to data sources...</p>
            <p style={{ color: 'var(--color-brand-primary)' }}>↻ Extracting intelligence...</p>
          </div>
          <div style={{ marginTop: 'var(--space-7)', height: '4px', background: 'var(--color-bg-primary)', overflow: 'hidden', borderRadius: '2px' }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--color-brand-primary)', transition: 'width 1s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'var(--space-7) auto' }}>
      <h2>Add Contact</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-7)' }}>Enter a LinkedIn URL to initiate research and intelligence gathering.</p>
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="body-text-important" style={{ display: 'block', marginBottom: '6px' }}>LinkedIn Profile URL</label>
          <input 
            type="url" 
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            style={{ width: '100%', height: '40px', padding: '0 var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={createMutation.isPending}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {createMutation.isPending ? 'Initiating...' : 'Start Research'}
        </button>
      </form>
    </div>
  );
};
