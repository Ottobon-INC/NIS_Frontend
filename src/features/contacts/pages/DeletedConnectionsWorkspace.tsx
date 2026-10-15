import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useDeletedContacts } from '../../../hooks/useDeletedContacts';
import { contactsApi } from '../../../services/api/contacts.api';
import { UserX, RotateCcw } from 'lucide-react';

export const DeletedConnectionsWorkspace: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: deletedContacts, isLoading, isError } = useDeletedContacts();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const restoreMutation = useMutation({
    mutationFn: (id: string) => contactsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-contacts'] });
      setRestoringId(null);
    },
    onError: (err: any) => {
      alert(`Failed to restore connection: ${err.message || 'Unknown error'}`);
      setRestoringId(null);
    }
  });

  const handleRestore = (id: string) => {
    setRestoringId(id);
    restoreMutation.mutate(id);
  };

  return (
    <WorkspaceShell
      title="Deleted Connection"
      subtitle="Archived log of deleted people."
      breadcrumbs={[
        { label: 'People', path: '/people' },
        { label: 'Deleted Connection', path: '/deleted-connections' }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!deletedContacts || deletedContacts.length === 0)}
      emptyStateMessage="No deleted connections recorded."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--space-4)',
        maxWidth: '1200px'
      }}>
        {deletedContacts && deletedContacts.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 'var(--space-5)',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', overflow: 'hidden' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F1F5F9',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <UserX size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  display: 'block',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {item.name}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleRestore(item.id)}
              disabled={restoringId === item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #BBF7D0',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: restoringId === item.id ? 'not-allowed' : 'pointer',
                opacity: restoringId === item.id ? 0.6 : 1,
                flexShrink: 0
              }}
            >
              <RotateCcw size={13} />
              {restoringId === item.id ? 'Restoring...' : 'Restore'}
            </button>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
};
