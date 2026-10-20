import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
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
      queryClient.invalidateQueries({ queryKey: ['bhanu-connections'] });
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
              Upload LinkedIn <code>Connections.csv</code> to populate the route engine.
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
              Now go to <strong>Network → Bhanu's Connections</strong> to score each contact's relationship strength and reachability.
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
  const [showImport, setShowImport] = useState(false);
  const [activeTab, setActiveTab] = useState<'targets' | 'bhanu'>('targets');

  const { data: bhanuConnections = [] } = useQuery<any[]>({
    queryKey: ['bhanu-connections'],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/v1/bhanu/connections?limit=200`, {
        headers: token ? { Authorization: token } : {}
      });
      if (!res.ok) return [];
      return res.json();
    }
  });

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

  const filteredBhanu = React.useMemo(() => {
    if (!bhanuConnections) return [];
    if (!query) return bhanuConnections;
    return bhanuConnections.filter((c: any) => 
      (c.full_name || '').toLowerCase().includes(query) || 
      (c.current_company || '').toLowerCase().includes(query) || 
      (c.current_title || '').toLowerCase().includes(query)
    );
  }, [bhanuConnections, query]);

  const currentList = activeTab === 'targets' ? filteredContacts : filteredBhanu;

  return (
    <>
      {showImport && <CsvImportModal onClose={() => setShowImport(false)} />}
      <WorkspaceShell
        title="People & Relationships"
        subtitle={query ? `Search results for "${query}"` : "Understand who matters, why they matter, and what connects them."}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && currentList.length === 0}
        emptyStateMessage={query ? `No results found matching "${query}".` : activeTab === 'targets' ? "No target people in your pipeline yet." : "No connections imported from Bhanu's network yet."}
        headerActions={
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
        }
      >
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('targets')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: activeTab === 'targets' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'targets' ? 'var(--color-brand-primary)' : '#fff',
            color: activeTab === 'targets' ? '#fff' : 'var(--color-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          🎯 Target Prospects
          <span style={{ 
            fontSize: '11px', 
            padding: '2px 6px', 
            borderRadius: '10px', 
            background: activeTab === 'targets' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
            color: activeTab === 'targets' ? '#fff' : '#64748B'
          }}>
            {filteredContacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bhanu')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: activeTab === 'bhanu' ? '1px solid #6366f1' : '1px solid var(--color-border)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'bhanu' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
            color: activeTab === 'bhanu' ? '#fff' : 'var(--color-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          🤝 Bhanu's Network (Route Pool)
          <span style={{ 
            fontSize: '11px', 
            padding: '2px 6px', 
            borderRadius: '10px', 
            background: activeTab === 'bhanu' ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
            color: activeTab === 'bhanu' ? '#fff' : '#4F46E5'
          }}>
            {bhanuConnections.length}
          </span>
        </button>
      </div>

      {activeTab === 'targets' ? (
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
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {filteredBhanu.map((bc: any) => (
          <div 
            key={bc.id}
            style={{ 
              padding: 'var(--space-6)', 
              background: '#fff', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--color-border)', 
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px',
                flexShrink: 0
              }}>
                {(bc.full_name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h3 className="card-title" style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 600 }}>{bc.full_name || 'Connection'}</h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {bc.current_title && bc.current_company 
                    ? `${bc.current_title} · ${bc.current_company}` 
                    : bc.current_title || bc.current_company || 'LinkedIn Connection'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '3px 8px', 
                  background: bc.is_scored ? '#ECFDF5' : '#FEF3C7', 
                  color: bc.is_scored ? '#047857' : '#B45309',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600
                }}>
                  {bc.is_scored ? `★ Strength: ${bc.relationship_strength}/5` : 'Unscored'}
                </span>
                {bc.reachability && bc.reachability !== 'UNKNOWN' && (
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '3px 8px', 
                    background: '#F1F5F9', 
                    color: '#475569',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500
                  }}>
                    {bc.reachability}
                  </span>
                )}
              </div>

              {bc.connected_since && (
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Connected: {bc.connected_since}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
      </WorkspaceShell>
    </>
  );
};
