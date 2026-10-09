import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useTrustedContext } from '../../../hooks/useTrustedContext';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';

export const TrustedContextWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // contactId
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  const { data, isLoading, isError, updateContext } = useTrustedContext(id || '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  if (!id) return <div>Invalid Contact ID</div>;

  const handleEditStart = (itemId: string, content: string) => {
    setEditingId(itemId);
    setEditContent(content);
  };

  const handleEditSave = (itemId: string) => {
    updateContext.mutate({ itemId, newContent: editContent });
    setEditingId(null);
  };

  return (
    <WorkspaceShell
      title="Trusted Context"
      subtitle="Verified Intelligence forming the foundation for downstream decisions."
      breadcrumbs={[
        { label: 'People', path: '/people' },
        { label: 'Contact', path: `/people/${id}` },
        { label: 'Trusted Context', path: `/people/${id}/context` }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!data?.items || data.items.length === 0)}
      emptyStateMessage="No trusted context has been established yet."
      primaryAction={{ label: 'Return to Contact 360', onClick: () => navigate(`/people/${id}`) }}
    >
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)', maxWidth: '900px' }}>
          
          <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
              This information has passed the Founder Validation boundary. It is now considered <strong>Trusted Context</strong> and will be used by the Opportunity Engine and Network Matcher.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {data.items.map(item => (
              <div key={item.id} style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-brand-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span className="labels" style={{ padding: '2px 8px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>{item.type}</span>
                    <TrustBadge level="CONFIRMED" />
                  </div>
                  <div className="labels text-secondary" style={{ background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Version {item.currentVersion}
                  </div>
                </div>

                {editingId === item.id ? (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', minHeight: '80px', marginBottom: 'var(--space-2)' }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button onClick={() => setEditingId(null)} style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-sm)', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => handleEditSave(item.id)} style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-sm)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Update Context</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0', lineHeight: 1.5 }}>{item.content}</p>
                    <button 
                      onClick={() => handleEditStart(item.id, item.content)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    >
                      Edit Context
                    </button>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="button-text"
                    onClick={() => openEvidenceDrawer(item.id, 'CONFIRMED', item.content)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                  >
                    View Source Evidence
                  </button>
                  
                  {item.history.length > 0 && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Last updated: {new Date(item.history[item.history.length - 1].timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {item.history.length > 1 && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
                    <p className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Version History</p>
                    <ul className="body-text text-secondary" style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                      {item.history.slice(0, -1).map(h => (
                        <li key={h.version} style={{ marginBottom: 'var(--space-1)' }}>
                          v{h.version}: "{h.content}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
