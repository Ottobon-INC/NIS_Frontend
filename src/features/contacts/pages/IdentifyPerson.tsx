import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../../services/api/contacts.api';

export const IdentifyPerson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    title: '',
    company: '',
    location: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['identify', id],
    queryFn: () => contactsApi.getIdentify(id!),
    refetchInterval: (query) => {
      if (query.state.data && (query.state.data.title === 'Analyzing profile...' || query.state.data.company === 'Pending research')) {
        return 2000;
      }
      return false;
    }
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        name: data.name || '',
        title: data.title || '',
        company: data.company || '',
        location: data.location || ''
      });
    }
  }, [data]);

  const confirmMutation = useMutation({
    mutationFn: (overridePayload?: any) => contactsApi.confirmIdentify(id!, overridePayload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      const targetId = res?.contact_id || id;
      navigate(`/people/${targetId}`);
    }
  });

  if (isLoading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Loading identity data...</p>;
  if (!data) return <p style={{ padding: '2rem', textAlign: 'center' }}>No data found.</p>;

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    confirmMutation.mutate(formValues);
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'var(--space-7) auto', padding: '0 1rem' }}>
      <h2 className="page-title" style={{ marginBottom: 'var(--space-2)' }}>Identify Person</h2>
      <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-7)' }}>
        Please confirm the AI extracted identity before we finalize the Contact 360 profile.
      </p>
      
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-7)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {data.linkedinUrl && (
          <div style={{ marginBottom: 'var(--space-5)', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-brand-primary)' }}>Target Link:</span>
            <a href={data.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>
              {data.linkedinUrl}
            </a>
          </div>
        )}

        {!isEditing ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-7)', paddingBottom: 'var(--space-7)', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h1 className="section-title" style={{ marginBottom: 'var(--space-2)', fontSize: '1.5rem', fontWeight: 700 }}>{data.name}</h1>
                <p className="body-text" style={{ fontSize: '1.05rem', color: '#334155', fontWeight: 500 }}>
                  {data.title} {data.company ? `at ${data.company}` : ''}
                </p>
                <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)', color: '#64748b' }}>{data.location}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="labels" style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--color-bg-primary)', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  AI CONFIDENCE: {data.confidence}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                style={{ padding: 'var(--space-3) var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
              >
                Reject / Correct
              </button>
              <button 
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="button-text"
                style={{ padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
              >
                {confirmMutation.isPending ? 'Confirming...' : 'Confirm Identity'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSaveCorrection}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: 'var(--space-6)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={formValues.name}
                  onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Job Title</label>
                <input 
                  type="text" 
                  value={formValues.title}
                  onChange={e => setFormValues(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Organization / Company</label>
                <input 
                  type="text" 
                  value={formValues.company}
                  onChange={e => setFormValues(prev => ({ ...prev, company: e.target.value }))}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Location</label>
                <input 
                  type="text" 
                  value={formValues.location}
                  onChange={e => setFormValues(prev => ({ ...prev, location: e.target.value }))}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ padding: 'var(--space-3) var(--space-6)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={confirmMutation.isPending}
                style={{ padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
              >
                {confirmMutation.isPending ? 'Saving...' : 'Save & Confirm Identity'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
