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
  const { data, isLoading, isError, updateContext, createContext, deleteContext } = useTrustedContext(id || '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'PROBLEM' | 'REQUIREMENT' | 'PERSON' | 'SIGNAL'>('PROBLEM');
  const [newContent, setNewContent] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!id) return <div>Invalid Contact ID</div>;

  const handleEditStart = (itemId: string, content: string) => {
    setEditingId(itemId);
    setEditContent(content);
    setActionError(null);
  };

  const handleEditSave = async (itemId: string) => {
    if (!editContent.trim()) {
      setActionError('Context statement cannot be empty.');
      return;
    }
    setActionError(null);
    try {
      await updateContext.mutateAsync({ itemId, newContent: editContent.trim() });
      setEditingId(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update context.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setActionError('Content is required.');
      return;
    }
    setActionError(null);
    try {
      await createContext.mutateAsync({
        type: newType,
        content: newContent.trim(),
        evidence: newEvidence.trim() || undefined,
      });
      setShowAddModal(false);
      setNewContent('');
      setNewEvidence('');
      setNewType('PROBLEM');
    } catch (err: any) {
      setActionError(err.message || 'Failed to add trusted context.');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to remove this trusted context record?')) {
      return;
    }
    setActionError(null);
    try {
      await deleteContext.mutateAsync(itemId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete trusted context.');
    }
  };

  const isSaving = updateContext.isPending || createContext.isPending || deleteContext.isPending;

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
      emptyStateMessage="No trusted context has been established yet. Add a verified problem or requirement to form ground truth."
      primaryAction={{ label: '+ Add Context', onClick: () => { setActionError(null); setShowAddModal(true); } }}
      secondaryActions={[{ label: 'Return to Contact 360', onClick: () => navigate(`/people/${id}`) }]}
    >
      {actionError && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: '#991b1b',
          fontSize: 'var(--font-size-sm)',
          marginBottom: 'var(--space-4)',
        }}>
          {actionError}
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '900px' }}>
          
          <div style={{
            padding: 'var(--space-5)',
            background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.7) 0%, rgba(240, 253, 250, 0.7) 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #c7d2fe',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: '#1e293b' }}>
              This intelligence has passed the <strong>Founder Validation Boundary</strong>. It represents canonical, verified ground truth utilized downstream by the Opportunity Engine, Capability Matching, and Network Introductions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {data.items.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="labels" style={{
                      padding: '3px 10px',
                      background: item.type === 'PROBLEM' ? '#fee2e2' : item.type === 'REQUIREMENT' ? '#dcfce7' : '#e0e7ff',
                      color: item.type === 'PROBLEM' ? '#991b1b' : item.type === 'REQUIREMENT' ? '#166534' : '#3730a3',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '11px',
                    }}>
                      {item.type}
                    </span>
                    <TrustBadge level="CONFIRMED" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="labels text-secondary" style={{ background: 'var(--color-bg-primary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px' }}>
                      Version {item.currentVersion}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontSize: '14px',
                      }}
                      title="Delete record"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {editingId === item.id ? (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-brand-primary)',
                        fontFamily: 'inherit',
                        minHeight: '80px',
                        marginBottom: 'var(--space-2)',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={isSaving}
                        style={{
                          padding: 'var(--space-1) var(--space-3)',
                          fontSize: 'var(--font-size-sm)',
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(item.id)}
                        disabled={isSaving}
                        style={{
                          padding: 'var(--space-1) var(--space-3)',
                          fontSize: 'var(--font-size-sm)',
                          background: 'var(--color-brand-primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {isSaving ? 'Updating...' : 'Update Context'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0', lineHeight: 1.5, fontSize: '15px', color: '#0f172a' }}>
                      {item.content}
                    </p>
                    <button 
                      onClick={() => handleEditStart(item.id, item.content)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-brand-primary)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 600,
                      }}
                    >
                      ✎ Edit Context
                    </button>
                  </div>
                )}

                {item.evidence && (
                  <div style={{ marginBottom: 'var(--space-3)', fontSize: '13px', color: 'var(--color-text-secondary)', background: '#f8fafc', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Evidence:</strong> {item.evidence}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="button-text"
                    onClick={() => openEvidenceDrawer(item.id, 'CONFIRMED', item.content)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                  >
                    View Source Evidence →
                  </button>
                  
                  {item.history && item.history.length > 0 && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Last updated: {new Date(item.history[item.history.length - 1].timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {item.history && item.history.length > 1 && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
                    <p className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0', fontWeight: 600 }}>Previous Versions (Audit Provenance)</p>
                    <ul className="body-text text-secondary" style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: '13px' }}>
                      {item.history.slice(0, -1).map(h => (
                        <li key={h.version} style={{ marginBottom: 'var(--space-1)' }}>
                          <strong>v{h.version}:</strong> "{h.content}"
                          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>({new Date(h.timestamp).toLocaleDateString()})</span>
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

      {/* Add Context Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            padding: 'var(--space-6)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>+ Establish Trusted Context</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                  Context Dimension
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    background: '#fff',
                  }}
                >
                  <option value="PROBLEM">Business Problem / Operational Bottleneck</option>
                  <option value="REQUIREMENT">Technical / Capability Requirement</option>
                  <option value="PERSON">Champion / Person Ground Truth</option>
                  <option value="SIGNAL">Strategic Intent Signal</option>
                </select>
              </div>

              <div>
                <label className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                  Verified Insight Content *
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter the founder-verified ground truth statement..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    minHeight: '90px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                  Supporting Evidence / Citation (Optional)
                </label>
                <input
                  type="text"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="e.g., Direct quote from Q3 planning meeting or verified leadership comms"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--color-brand-primary)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save as Trusted Context'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
