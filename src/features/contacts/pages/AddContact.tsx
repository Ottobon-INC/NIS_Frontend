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

const SUGGESTED_LEADERS = [
  { name: 'Satya Nadella', role: 'Chairman & CEO, Microsoft', url: 'https://www.linkedin.com/in/satyanadella' },
  { name: 'Sam Altman', role: 'CEO, OpenAI', url: 'https://www.linkedin.com/in/samaltman' },
  { name: 'Jensen Huang', role: 'Founder & CEO, NVIDIA', url: 'https://www.linkedin.com/in/jenhsunhuang' },
  { name: 'Sundar Pichai', role: 'CEO, Google & Alphabet', url: 'https://www.linkedin.com/in/sundarpichai' },
  { name: 'Tim Cook', role: 'CEO, Apple', url: 'https://www.linkedin.com/in/tim-cook-apple' },
  { name: 'Mark Zuckerberg', role: 'Founder & CEO, Meta', url: 'https://www.linkedin.com/in/mark-zuckerberg-618b7610' },
];

  return (
    <div style={{ maxWidth: '640px', margin: 'var(--space-7) auto' }}>
      <h2>Add Contact</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-7)' }}>Enter a LinkedIn URL to initiate research and intelligence gathering.</p>
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="body-text-important" style={{ display: 'block', marginBottom: '6px' }}>LinkedIn Profile URL</label>
          <input 
            type="url" 
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            style={{ width: '100%', height: '42px', padding: '0 var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={createMutation.isPending}
          className="btn btn-primary"
          style={{ width: '100%', height: '42px', fontWeight: 600 }}
        >
          {createMutation.isPending ? 'Initiating...' : 'Start Research'}
        </button>
      </form>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Suggested Top Leaders
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>Click to autofill</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {SUGGESTED_LEADERS.map((leader) => (
            <div
              key={leader.url}
              onClick={() => setUrl(leader.url)}
              style={{
                padding: '12px 14px',
                background: url === leader.url ? '#eff6ff' : '#fff',
                border: url === leader.url ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={e => {
                if (url !== leader.url) e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={e => {
                if (url !== leader.url) e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {leader.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {leader.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
