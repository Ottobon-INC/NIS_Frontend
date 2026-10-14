import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContacts } from '../../../hooks/useContacts';
import { contactsApi } from '../../../services/api/contacts.api';

export const PeopleWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: contacts, isLoading, isError } = useContacts();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => contactsApi.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-contacts'] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      alert(`Failed to delete contact: ${err.message || 'Unknown error'}`);
      setDeletingId(null);
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name || 'this contact'}"? This action cannot be undone.`)) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

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
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-brand-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px',
                flexShrink: 0
              }}>
                {(contact.name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h3 className="card-title" style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 600 }}>{contact.name || 'Contact'}</h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {contact.title && contact.company 
                    ? `${contact.title} · ${contact.company}` 
                    : contact.title || contact.company || 'Professional'}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
              <span className="labels" style={{ 
                fontSize: 'var(--font-size-xs)', 
                padding: '3px 8px', 
                background: contact.status === 'READY' || contact.status === 'INTELLIGENCE_READY' ? '#ECFDF5' : '#F1F5F9', 
                color: contact.status === 'READY' || contact.status === 'INTELLIGENCE_READY' ? '#047857' : '#475569',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600
              }}>
                {contact.status === 'PROCESSING' ? 'RESEARCHING' : contact.status.replace('_', ' ')}
              </span>

              <button
                type="button"
                title="Delete connection"
                onClick={(e) => handleDelete(e, contact.id, contact.name)}
                disabled={deletingId === contact.id}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: deletingId === contact.id ? 'not-allowed' : 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (deletingId !== contact.id) {
                    e.currentTarget.style.color = '#DC2626';
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletingId !== contact.id) {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {deletingId === contact.id ? (
                  <span style={{ color: '#DC2626', fontSize: '11px' }}>Deleting...</span>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
};
