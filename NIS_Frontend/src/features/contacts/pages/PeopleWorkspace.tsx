import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContacts } from '../../../hooks/useContacts';

export const PeopleWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: contacts, isLoading, isError } = useContacts();

  const query = searchParams.get('q')?.toLowerCase() || '';
  
  const filteredContacts = React.useMemo(() => {
    if (!contacts) return [];
    if (!query) return contacts;
    return contacts.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.company.toLowerCase().includes(query) || 
      c.title.toLowerCase().includes(query)
    );
  }, [contacts, query]);

  return (
    <WorkspaceShell
      title="People & Relationships"
      subtitle={query ? `Search results for "${query}"` : "Understand who matters, why they matter, and what connects them."}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && filteredContacts.length === 0}
      emptyStateMessage={query ? `No people found matching "${query}".` : "No people in your network yet."}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {filteredContacts.map(contact => (
          <div 
            key={contact.id} 
            onClick={() => navigate(`/people/${contact.id}`)}
            style={{ 
              padding: 'var(--space-6)', 
              background: '#fff', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--color-border)', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              transition: 'all 0.2s'
            }}
          >
            <div>
              <h3 className="card-title" style={{ margin: '0 0 var(--space-1) 0' }}>{contact.name}</h3>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{contact.title} · {contact.company}</p>
            </div>
            
            <div>
              <span className="labels" style={{ 
                fontSize: 'var(--font-size-xs)', 
                padding: 'var(--space-1) var(--space-2)', 
                background: contact.status === 'INTELLIGENCE_READY' ? 'var(--color-brand-primary)' : 'var(--color-bg-primary)', 
                color: contact.status === 'INTELLIGENCE_READY' ? '#fff' : 'var(--color-text-primary)',
                borderRadius: 'var(--radius-sm)'
              }}>
                {contact.status === 'PROCESSING' ? 'RESEARCHING' : contact.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
};
