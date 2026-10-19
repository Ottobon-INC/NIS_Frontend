import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { contactsApi } from '../../../services/api/contacts.api';

export const AddContact = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(30);
  const [stage, setStage] = useState(1);

  const createMutation = useMutation<
    { id: string; contactId?: string; status: string },
    Error,
    { linkedinUrl: string }
  >({
    mutationFn: contactsApi.create,
    onSuccess: (data) => {
      setJobId(data.id);
      if (data.contactId) setContactId(data.contactId);
    }
  });

  const { data: statusData } = useQuery({
    queryKey: ['contactStatus', jobId],
    queryFn: () => contactsApi.getStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'COMPLETED' || s === 'PARTIAL' || s === 'READY' || s === 'FAILED') {
        return false;
      }
      return 800;
    }
  });

  // Animated progress stages while research is running
  useEffect(() => {
    if (!jobId) return;

    const t1 = setTimeout(() => {
      setProgressPercent(60);
      setStage(2);
    }, 800);

    const t2 = setTimeout(() => {
      setProgressPercent(85);
      setStage(3);
    }, 1800);

    const t3 = setTimeout(() => {
      setProgressPercent(100);
      setStage(4);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [jobId]);

  // Navigate when research status reaches a terminal or ready state
  useEffect(() => {
    if (!jobId) return;
    const s = statusData?.status;
    if (s === 'COMPLETED' || s === 'PARTIAL' || s === 'READY') {
      const timer = setTimeout(() => {
        navigate(`/contacts/${contactId || jobId}/identify`);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [statusData, navigate, jobId, contactId]);

  // Fallback safety timer: guarantees transition within 4.5 seconds so user is never stuck
  useEffect(() => {
    if (!jobId) return;
    const timer = setTimeout(() => {
      navigate(`/contacts/${contactId || jobId}/identify`);
    }, 4500);
    return () => clearTimeout(timer);
  }, [jobId, contactId, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) createMutation.mutate({ linkedinUrl: url });
  };

  if (jobId) {
    const target = contactId || jobId;
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Researching Contact</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
          Extracting verified professional intelligence from LinkedIn & external data sources...
        </p>

        <div style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-7)',
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontWeight: 500 }}>
              <span>✓</span>
              <span>Initiating profile resolution...</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: stage >= 2 ? '#16a34a' : 'var(--color-brand-primary)', fontWeight: stage >= 2 ? 500 : 600 }}>
              <span>{stage >= 2 ? '✓' : '↻'}</span>
              <span>Connecting to data sources & web providers...</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: stage >= 3 ? '#16a34a' : (stage === 2 ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)'), fontWeight: stage === 2 ? 600 : (stage >= 3 ? 500 : 400) }}>
              <span>{stage >= 3 ? '✓' : (stage >= 2 ? '↻' : '○')}</span>
              <span>Extracting intelligence & career history...</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: stage >= 4 ? '#16a34a' : (stage === 3 ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)'), fontWeight: stage === 3 ? 600 : (stage >= 4 ? 500 : 400) }}>
              <span>{stage >= 4 ? '✓' : (stage >= 3 ? '↻' : '○')}</span>
              <span>Finalizing profile identity...</span>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-7)', height: '6px', background: '#e2e8f0', overflow: 'hidden', borderRadius: '3px' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100 ? '#16a34a' : 'var(--color-brand-primary)',
              transition: 'width 0.8s ease-in-out'
            }} />
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/contacts/${target}/identify`)}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>Proceed to Identity Review</span>
              <span>→</span>
            </button>
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
