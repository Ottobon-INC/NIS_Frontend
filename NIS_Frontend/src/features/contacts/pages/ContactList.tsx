import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../../services/api/contacts.api';

export const ContactList = () => {
  const navigate = useNavigate();
  const { data: contacts, isLoading, isError } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.list
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-7)' }}>
        <h2>Contacts</h2>
        <button 
          onClick={() => navigate('/contacts/new')}
          style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)' }}
        >
          Add Contact
        </button>
      </div>

      {isLoading && <p>Loading contacts...</p>}
      {isError && <p style={{ color: 'var(--color-error)' }}>Failed to load contacts.</p>}

      {!isLoading && !isError && contacts && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
                <th style={{ padding: 'var(--space-4)' }}>Name</th>
                <th style={{ padding: 'var(--space-4)' }}>Company</th>
                <th style={{ padding: 'var(--space-4)' }}>Status</th>
                <th style={{ padding: 'var(--space-4)' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(contacts) && contacts.map(c => (
                <tr 
                  key={c.id} 
                  style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                  onClick={() => navigate(`/contacts/${c.id}`)}
                >
                  <td className="body-text-important" style={{ padding: 'var(--space-4)' }}>{c.name}<br/><span className="body-text text-secondary">{c.title}</span></td>
                  <td style={{ padding: 'var(--space-4)' }}>{c.company}</td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{c.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
