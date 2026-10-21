import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContacts } from '../../../hooks/useContacts';
import { contactsApi } from '../../../services/api/contacts.api';
import { getAuthToken } from '../../../services/api/core/client.ts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── CSV Import Modal ──────────────────────────────────────────────────────────
interface ImportResult {
  batch_id: string;
  total_rows: number;
  imported: number;
  skipped_duplicates: number;
  errors: string[];
}

const CsvImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) { setError('Please select a .csv file.'); return; }
    setFile(f); setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/v1/bhanu/import-csv`, {
        method: 'POST',
        headers: token ? { Authorization: token } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data: ImportResult = await res.json();
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['network-graph'] });
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '16px', padding: '32px', width: '100%',
        maxWidth: '480px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', display: 'flex',
        flexDirection: 'column', gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Import Bhanu's Network</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Upload LinkedIn <code>Connections.csv</code> to populate the network intelligence graph.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>

        {!result ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#6366f1' : file ? '#22c55e' : '#cbd5e1'}`,
                borderRadius: '12px', padding: '32px 16px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                background: dragging ? '#eef2ff' : file ? '#f0fdf4' : '#f8fafc'
              }}
            >
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{file ? '✅' : '📄'}</div>
              {file
                ? <p style={{ margin: 0, fontWeight: 600, color: '#16a34a' }}>{file.name}</p>
                : <><p style={{ margin: '0 0 4px', fontWeight: 600, color: '#334155' }}>Drop CSV here or click to browse</p>
                   <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>LinkedIn → Me → Settings → Data Privacy → Get a copy of your data → Connections.csv</p></>
              }
            </div>

            {error && <p style={{ margin: 0, color: '#dc2626', fontSize: '13px', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '14px', color: '#475569' }}>Cancel</button>
              <button onClick={handleUpload} disabled={!file || uploading} style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: file && !uploading ? 'pointer' : 'not-allowed',
                fontWeight: 600, fontSize: '14px', color: '#fff',
                background: file && !uploading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#cbd5e1',
                transition: 'all 0.2s'
              }}>
                {uploading ? 'Importing…' : 'Import CSV'}
              </button>
            </div>
          </>
        ) : (
          /* Success summary */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
              {[
                { label: 'Total Rows', value: result.total_rows, color: '#334155' },
                { label: 'Imported', value: result.imported, color: '#16a34a' },
                { label: 'Skipped', value: result.skipped_duplicates, color: '#d97706' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
            {result.errors.length > 0 && (
              <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#dc2626' }}>
                <strong>Partial errors ({result.errors.length}):</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Connections imported into <strong>Network Intelligence</strong>. Open the Network Graph to explore reachability, relationship paths, and initiate Deep Research.
            </p>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PeopleWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: contacts, isLoading, isError } = useContacts();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [viewMode, setViewMode] = useState<'accepted' | 'pending' | 'all'>('accepted');
  const [typeFilter, setTypeFilter] = useState<'all' | 'targets' | 'network'>('all');

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => contactsApi.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      alert(`Failed to delete contact: ${err.message || 'Unknown error'}`);
      setDeletingId(null);
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async (contactId: string) => {
      setAcceptingId(contactId);
      return await contactsApi.acceptContact(contactId);
    },
    onSuccess: (_data, contactId) => {
      const contact = (contacts || []).find(c => c.id === contactId);
      const name = contact?.name || 'Contact';
      setActionToast({ message: `✓ "${name}" accepted into People & Relationships`, type: 'success' });
      setTimeout(() => setActionToast(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setAcceptingId(null);
    },
    onError: (err: any) => {
      alert(`Failed to accept contact: ${err.message || 'Unknown error'}`);
      setAcceptingId(null);
    }
  });

  const declineMutation = useMutation({
    mutationFn: async (contactId: string) => {
      setDecliningId(contactId);
      return await contactsApi.declineContact(contactId);
    },
    onSuccess: (_data, contactId) => {
      const contact = (contacts || []).find(c => c.id === contactId);
      const name = contact?.name || 'Contact';
      setActionToast({ message: `Declined "${name}". Profile archived.`, type: 'info' });
      setTimeout(() => setActionToast(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDecliningId(null);
    },
    onError: (err: any) => {
      alert(`Failed to decline contact: ${err.message || 'Unknown error'}`);
      setDecliningId(null);
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

  // Active (non-archived) contacts
  const activeContacts = React.useMemo(() => {
    return (contacts || []).filter(c => c.card_status !== 'ARCHIVED');
  }, [contacts]);

  const acceptedContacts = React.useMemo(() => {
    return activeContacts.filter(c => Boolean(c.founder_reviewed));
  }, [activeContacts]);

  const pendingContacts = React.useMemo(() => {
    return activeContacts.filter(c => !c.founder_reviewed);
  }, [activeContacts]);

  const acceptedCount = acceptedContacts.length;
  const pendingCount = pendingContacts.length;
  const totalCount = activeContacts.length;

  const currentTabBaseList = React.useMemo(() => {
    if (viewMode === 'accepted') return acceptedContacts;
    if (viewMode === 'pending') return pendingContacts;
    return activeContacts;
  }, [viewMode, acceptedContacts, pendingContacts, activeContacts]);

  const filteredContacts = React.useMemo(() => {
    let list = currentTabBaseList;
    if (typeFilter === 'targets') {
      list = list.filter(c => (c.contact_type || 'TARGET') === 'TARGET' || c.contact_type === 'TARGET_PROSPECT');
    } else if (typeFilter === 'network') {
      list = list.filter(c => c.contact_type === 'BHANU_CONNECTION');
    }

    if (!query) return list;
    return list.filter(c => 
      (c.name || '').toLowerCase().includes(query) || 
      (c.company || '').toLowerCase().includes(query) || 
      (c.title || '').toLowerCase().includes(query)
    );
  }, [currentTabBaseList, typeFilter, query]);

  return (
    <>
      {showImport && <CsvImportModal onClose={() => setShowImport(false)} />}
      
      {/* Toast notification */}
      {actionToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: actionToast.type === 'success' ? '#1D4ED8' : '#1E293B',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}>
          {actionToast.message}
        </div>
      )}

      <WorkspaceShell
        title="People & Relationships"
        subtitle={
          query
            ? `Search results for "${query}"`
            : viewMode === 'accepted'
              ? "Your active network. Only contacts you have explicitly accepted appear here."
              : viewMode === 'pending'
                ? "Researched candidates awaiting your review and acceptance."
                : "All researched contacts across your workspace."
        }
        isLoading={isLoading}
        isError={isError}
        isEmpty={false}
        headerActions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/network')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: '#fff',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              🌐 Network Intelligence
            </button>
            <button
              onClick={() => setShowImport(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import Bhanu's CSV
            </button>
          </div>
        }
      >
        {/* Network Discovery & Acceptance Guidance Callout Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>🛡️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                Researched Profiles Require Your Acceptance
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Researched contacts from Bhanu's 820+ network or new targets only enter <strong>People & Relationships</strong> once you accept them.
                {pendingCount > 0 && (
                  <span style={{ marginLeft: '6px', color: '#4F46E5', fontWeight: 600 }}>
                    ({pendingCount} profile{pendingCount > 1 ? 's' : ''} awaiting review)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {pendingCount > 0 && viewMode !== 'pending' && (
              <button
                onClick={() => setViewMode('pending')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6366F1',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(99, 102, 241, 0.3)'
                }}
              >
                Review Pending ({pendingCount}) →
              </button>
            )}
            <button
              onClick={() => navigate('/network')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #C7D2FE',
                background: '#fff',
                color: '#4F46E5',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(79, 70, 229, 0.06)'
              }}
            >
              Open Network Graph →
            </button>
          </div>
        </div>

        {/* Primary Acceptance Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('accepted')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: viewMode === 'accepted' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: viewMode === 'accepted' ? 'var(--color-brand-primary)' : '#fff',
              color: viewMode === 'accepted' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            👥 People & Relationships
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 7px', 
              borderRadius: '10px', 
              background: viewMode === 'accepted' ? 'rgba(255,255,255,0.25)' : '#EFF6FF',
              color: viewMode === 'accepted' ? '#fff' : 'var(--color-brand-primary)',
              fontWeight: 700
            }}>
              {acceptedCount}
            </span>
          </button>

          <button
            onClick={() => setViewMode('pending')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: viewMode === 'pending' ? '1px solid #D97706' : '1px solid var(--color-border)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: viewMode === 'pending' ? '#D97706' : '#fff',
              color: viewMode === 'pending' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            ⏳ Pending Acceptance
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 7px', 
              borderRadius: '10px', 
              background: viewMode === 'pending' ? 'rgba(255,255,255,0.25)' : '#FEF3C7',
              color: viewMode === 'pending' ? '#fff' : '#B45309',
              fontWeight: 700
            }}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setViewMode('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: viewMode === 'all' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: viewMode === 'all' ? 'var(--color-brand-primary)' : '#fff',
              color: viewMode === 'all' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            All Researched
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 7px', 
              borderRadius: '10px', 
              background: viewMode === 'all' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: viewMode === 'all' ? '#fff' : '#64748B',
              fontWeight: 700
            }}>
              {totalCount}
            </span>
          </button>
        </div>

        {/* Secondary Category / Type Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginRight: '4px' }}>Filter:</span>
          <button
            onClick={() => setTypeFilter('all')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: typeFilter === 'all' ? '1px solid #475569' : '1px solid #E2E8F0',
              background: typeFilter === 'all' ? '#F1F5F9' : '#fff',
              color: typeFilter === 'all' ? '#1E293B' : '#64748B',
              fontSize: '12px',
              fontWeight: typeFilter === 'all' ? 600 : 500,
              cursor: 'pointer'
            }}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('targets')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: typeFilter === 'targets' ? '1px solid #0284C7' : '1px solid #E2E8F0',
              background: typeFilter === 'targets' ? '#E0F2FE' : '#fff',
              color: typeFilter === 'targets' ? '#0369A1' : '#64748B',
              fontSize: '12px',
              fontWeight: typeFilter === 'targets' ? 600 : 500,
              cursor: 'pointer'
            }}
          >
            🎯 Targets
          </button>
          <button
            onClick={() => setTypeFilter('network')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: typeFilter === 'network' ? '1px solid #6366F1' : '1px solid #E2E8F0',
              background: typeFilter === 'network' ? '#EEF2FF' : '#fff',
              color: typeFilter === 'network' ? '#4F46E5' : '#64748B',
              fontSize: '12px',
              fontWeight: typeFilter === 'network' ? 600 : 500,
              cursor: 'pointer'
            }}
          >
            🤝 Network
          </button>
        </div>

        {/* Empty state action helper when viewMode === 'accepted' and acceptedCount === 0 */}
        {viewMode === 'accepted' && acceptedCount === 0 && pendingCount > 0 && (
          <div style={{
            background: '#EFF6FF',
            border: '1px dashed #BFDBFE',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1E40AF' }}>
              You have {pendingCount} researched profile{pendingCount > 1 ? 's' : ''} waiting for your acceptance
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#2563EB', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              To keep your active People & Relationships clean, candidates are held in the review queue until you accept them.
            </p>
            <button
              onClick={() => setViewMode('pending')}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-brand-primary)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              Review Pending Profiles ({pendingCount}) →
            </button>
          </div>
        )}

        {/* Contacts Grid or Empty State */}
        {filteredContacts.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            background: '#fff',
            marginTop: '8px'
          }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', margin: 0, fontWeight: 500 }}>
              {query 
                ? `No results found matching "${query}".` 
                : viewMode === 'accepted'
                  ? pendingCount > 0
                    ? `No accepted contacts matching this filter. You have ${pendingCount} researched profile${pendingCount > 1 ? 's' : ''} in Pending Acceptance.`
                    : "No accepted people matching this filter."
                  : viewMode === 'pending'
                    ? "No profiles currently pending acceptance. All researched contacts have been accepted!"
                    : "No researched people in your workspace."}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {filteredContacts.map(contact => {
            const isBhanuConnection = contact.contact_type === 'BHANU_CONNECTION';
            const isAccepted = Boolean(contact.founder_reviewed);
            const isAccepting = acceptingId === contact.id;
            const isDeclining = decliningId === contact.id;

            return (
              <div 
                key={contact.id} 
                onClick={() => navigate(`/people/${contact.id}`)}
                style={{ 
                  padding: 'var(--space-6)', 
                  background: '#fff', 
                  borderRadius: 'var(--radius-lg)', 
                  border: isBhanuConnection ? '1px solid #E0E7FF' : '1px solid var(--color-border)', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isBhanuConnection
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'var(--color-brand-primary)',
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
                
                {/* Badges Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Acceptance Badge */}
                    {isAccepted ? (
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        background: '#EFF6FF',
                        color: 'var(--color-brand-primary)',
                        border: '1px solid #BFDBFE',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ✓ Accepted
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        background: '#FEF3C7',
                        color: '#B45309',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ⏳ Pending Acceptance
                      </span>
                    )}

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

                    {isBhanuConnection ? (
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '3px 7px', 
                        background: '#EEF2FF', 
                        color: '#4F46E5', 
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                      }}>
                        🤝 Network
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '3px 7px', 
                        background: '#F0F9FF', 
                        color: '#0369A1', 
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                      }}>
                        🎯 Target
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)', borderTop: '1px solid #F1F5F9' }}>
                  {!isAccepted ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => acceptMutation.mutate(contact.id)}
                        disabled={isAccepting}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--color-brand-primary)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isAccepting ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isAccepting ? 'Accepting…' : '✓ Accept'}
                      </button>
                      <button
                        type="button"
                        onClick={() => declineMutation.mutate(contact.id)}
                        disabled={isDeclining}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          background: '#fff',
                          color: '#64748B',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: isDeclining ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isDeclining ? 'Declining…' : '✕ Decline'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--color-brand-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>✓ In People Network</span>
                    </div>
                  )}

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
            );
          })}
          </div>
        )}
      </WorkspaceShell>
    </>
  );
};
