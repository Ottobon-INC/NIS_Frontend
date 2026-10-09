import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../../../services/api/network.api';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';

export const EcosystemEvents = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ecosystemEvents'],
    queryFn: networkApi.getEvents
  });

  if (isLoading) return <p>Loading network events...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Failed to load ecosystem events.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-7)' }}>
        <h1 className="page-title">Ecosystem Events</h1>
        <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>Network triggers mapped to actionable intelligence.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {data.events.map(ev => (
          <div key={ev.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
                <span className="body-text-important text-secondary">{ev.date}</span>
                <TrustBadge level="SIGNAL" />
                {ev.signalStrength === 'HIGH' && (
                  <span className="labels" style={{ color: 'var(--color-brand-primary)', background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    High Priority
                  </span>
                )}
              </div>
              <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{ev.title}</h3>
              <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-4)' }}>{ev.description}</p>
              
              <div className="body-text">
                <strong className="body-text-important">Trigger Context: </strong>
                <button 
                  className="button-text"
                  onClick={() => navigate(`/contacts/${ev.contactId}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {ev.contactName}
                </button>
              </div>
            </div>
            
            <button 
              className="button-text"
              onClick={() => navigate(`/contacts/${ev.contactId}/research`)}
              style={{ border: '1px solid var(--color-brand-primary)', background: '#fff', color: 'var(--color-brand-primary)', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-sm)' }}
            >
              Analyze Context
            </button>
          </div>
        ))}
        {data.events.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-9)', color: 'var(--color-text-secondary)' }}>
            No recent ecosystem events detected.
          </div>
        )}
      </div>
    </div>
  );
};
