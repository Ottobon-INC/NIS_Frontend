import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  Plus, 
  List, 
  Grid, 
  Trash2
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useContacts } from '../../../hooks/useContacts';
import { contactsApi, type ContactOverview } from '../../../services/api/contacts.api';
import { getAuthToken } from '../../../services/api/core/client.ts';
import { networkApi } from '../../../services/api/network.api';
import { NetworkGraphCanvas } from '../../network/components/NetworkGraphCanvas';

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
  const [viewMode, setViewMode] = useState<'all' | 'network' | 'companies' | 'pending' | 'graph'>('all');
  const [displayFormat, setDisplayFormat] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'activity'>('name');
  const [typeFilter, setTypeFilter] = useState<'all' | 'targets' | 'network'>('all');


  // Network graph view state
  const [graphSelectedNodeId, setGraphSelectedNodeId] = useState<string | null>(null);
  const [graphFilterType, setGraphFilterType] = useState<'ALL' | 'PERSON' | 'COMPANY'>('ALL');
  const [graphSearch, setGraphSearch] = useState('');
  const [graphResearchingId, setGraphResearchingId] = useState<string | null>(null);

  const { data: graphData, isLoading: isGraphLoading, isError: isGraphError, refetch: refetchGraph } = useQuery({
    queryKey: ['networkGraph'],
    queryFn: () => networkApi.getGraph(),
    enabled: viewMode === 'graph',
  });

  const handleGraphTriggerResearch = async (contactId?: string) => {
    if (!contactId) return;
    setGraphResearchingId(contactId);
    try {
      await networkApi.triggerDeepResearch(contactId);
      setActionToast({ message: `🚀 Research launched! Contact will appear in Pending Acceptance once analyzed.`, type: 'info' });
      setTimeout(() => setActionToast(null), 4000);
      await queryClient.invalidateQueries({ queryKey: ['networkGraph'] });
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setGraphResearchingId(null);
    } catch (e: any) {
      alert(`Failed to launch deep research: ${e.message || 'Unknown error'}`);
      setGraphResearchingId(null);
    }
  };

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

  // Sanitize out non-human web scraper artifacts (e.g. login wall page titles like "Sign in to your Zoho People account")
  const isWebScraperArtifact = (c: ContactOverview) => {
    const text = `${c.name || ''} ${c.title || ''} ${c.company || ''}`.toLowerCase();
    const junkPatterns = [
      'sign in to', 'log in to', 'login to', 'zoho people',
      '404 not found', 'access denied', 'robot verification', 'cookie policy'
    ];
    return junkPatterns.some(pattern => text.includes(pattern));
  };

  // Active (non-archived) contacts
  const activeContacts = React.useMemo(() => {
    return (contacts || []).filter(c => c.card_status !== 'ARCHIVED' && !isWebScraperArtifact(c));
  }, [contacts]);


  const pendingContacts = React.useMemo(() => {
    return activeContacts.filter(c => !c.founder_reviewed);
  }, [activeContacts]);

  const networkContacts = React.useMemo(() => {
    return activeContacts.filter(c => c.contact_type === 'BHANU_CONNECTION' || Boolean(c.founder_reviewed));
  }, [activeContacts]);

  const companiesList = React.useMemo(() => {
    const comps = new Set<string>();
    activeContacts.forEach(c => {
      const comp = (c.company || '').trim();
      if (comp) comps.add(comp);
    });
    return Array.from(comps);
  }, [activeContacts]);

  const pendingCount = pendingContacts.length;
  const networkCount = networkContacts.length;
  const companiesCount = companiesList.length;
  const totalCount = activeContacts.length;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const currentTabBaseList = React.useMemo(() => {
    if (viewMode === 'network') return networkContacts;
    if (viewMode === 'companies') return activeContacts.filter(c => Boolean(c.company));
    if (viewMode === 'pending') return pendingContacts;
    return activeContacts;
  }, [viewMode, networkContacts, activeContacts, pendingContacts]);

  const filteredContacts = React.useMemo(() => {
    let list = currentTabBaseList;
    if (typeFilter === 'targets') {
      list = list.filter(c => (c.contact_type || 'TARGET') === 'TARGET' || c.contact_type === 'TARGET_PROSPECT');
    } else if (typeFilter === 'network') {
      list = list.filter(c => c.contact_type === 'BHANU_CONNECTION');
    }

    const q = debouncedSearch || query;
    if (q) {
      list = list.filter(c => 
        (c.name || '').toLowerCase().includes(q) || 
        (c.company || '').toLowerCase().includes(q) || 
        (c.title || '').toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
      return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
    });
  }, [currentTabBaseList, typeFilter, debouncedSearch, query, sortBy]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Title', 'Company', 'Location', 'Relationship', 'Status'];
    const rows = filteredContacts.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${((c as any).location || 'San Francisco, CA').replace(/"/g, '""')}"`,
      `"${c.contact_type === 'BHANU_CONNECTION' ? 'Strong' : c.founder_reviewed ? 'Moderate' : 'Target'}"`,
      `"${c.founder_reviewed ? 'ACCEPTED' : 'PENDING'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `networkos_people_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };


  // Graph data calculations
  const rawGraphNodes = useMemo(() => graphData?.nodes || [], [graphData]);
  const rawGraphEdges = useMemo(() => graphData?.edges || [], [graphData]);

  const filteredGraphNodes = useMemo(() => {
    return rawGraphNodes.filter(n => {
      const matchesType = graphFilterType === 'ALL' || n.type === graphFilterType;
      const matchesSearch = !graphSearch || 
        n.label.toLowerCase().includes(graphSearch.toLowerCase()) || 
        (n.company || '').toLowerCase().includes(graphSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [rawGraphNodes, graphFilterType, graphSearch]);

  const selectedGraphNode = useMemo(() => {
    if (!graphSelectedNodeId) return rawGraphNodes[0] || null;
    return rawGraphNodes.find(n => n.id === graphSelectedNodeId) || null;
  }, [rawGraphNodes, graphSelectedNodeId]);

  const connectedGraphEdges = useMemo(() => {
    if (!selectedGraphNode) return [];
    return rawGraphEdges.filter(e => e.source === selectedGraphNode.id || e.target === selectedGraphNode.id);
  }, [rawGraphEdges, selectedGraphNode]);

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
        title="People"
        subtitle="All your contacts and professional connections"
        breadcrumbs={[
          { label: 'People', path: '/people' }
        ]}
        isLoading={isLoading}
        isError={isError}
        isEmpty={false}
        headerActions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode(viewMode === 'graph' ? 'all' : 'graph')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: viewMode === 'graph' ? '#0B132B' : '#fff',
                color: viewMode === 'graph' ? '#fff' : '#0F172A',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {viewMode === 'graph' ? 'List View' : 'Visual Graph'}
            </button>
            <button
              onClick={() => setShowImport(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={14} />
              Import Bhanu's CSV
            </button>
            <button
              onClick={() => navigate('/contacts/new')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563EB',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={15} />
              + Add People
            </button>
          </div>
        }
      >
        {/* Unreviewed Profiles Notice Banner */}
        {pendingCount > 0 && viewMode !== 'pending' && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <div style={{ fontSize: '13px', color: '#92400E' }}>
                <strong>{pendingCount} candidate profile{pendingCount > 1 ? 's' : ''}</strong> awaiting your review and acceptance into active network.
              </div>
            </div>
            <button
              onClick={() => setViewMode('pending')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#D97706',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Review Profiles ({pendingCount}) →
            </button>
          </div>
        )}

        {/* Screen 2 Segmented Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '18px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setViewMode('all')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: viewMode === 'all' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: viewMode === 'all' ? '#2563EB' : '#fff',
              color: viewMode === 'all' ? '#fff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            All People
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

          <button
            onClick={() => setViewMode('network')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: viewMode === 'network' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: viewMode === 'network' ? '#2563EB' : '#fff',
              color: viewMode === 'network' ? '#fff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            My Network
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 7px', 
              borderRadius: '10px', 
              background: viewMode === 'network' ? 'rgba(255,255,255,0.25)' : '#EFF6FF',
              color: viewMode === 'network' ? '#fff' : '#2563EB',
              fontWeight: 700
            }}>
              {networkCount}
            </span>
          </button>

          <button
            onClick={() => setViewMode('companies')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: viewMode === 'companies' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: viewMode === 'companies' ? '#2563EB' : '#fff',
              color: viewMode === 'companies' ? '#fff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            Companies
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 7px', 
              borderRadius: '10px', 
              background: viewMode === 'companies' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: viewMode === 'companies' ? '#fff' : '#64748B',
              fontWeight: 700
            }}>
              {companiesCount}
            </span>
          </button>

          {pendingCount > 0 && (
            <button
              onClick={() => setViewMode('pending')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: viewMode === 'pending' ? '1px solid #D97706' : '1px solid #FCD34D',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: viewMode === 'pending' ? '#D97706' : '#FFFBEB',
                color: viewMode === 'pending' ? '#fff' : '#B45309',
                transition: 'all 0.15s ease'
              }}
            >
              Pending Review
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
          )}
        </div>


        {viewMode === 'graph' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#fff',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
                <span style={{ fontSize: '16px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search person or company in network graph..."
                  value={graphSearch}
                  onChange={(e) => setGraphSearch(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#1E293B',
                    background: 'transparent'
                  }}
                />
                {graphSearch && (
                  <button
                    onClick={() => setGraphSearch('')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', fontSize: '12px' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {(['ALL', 'PERSON', 'COMPANY'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setGraphFilterType(t)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: graphFilterType === t ? '#4F46E5' : '#F1F5F9',
                      color: graphFilterType === t ? '#fff' : '#64748B',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t === 'ALL' ? '🌐 All Entities' : t === 'PERSON' ? '👤 People' : '🏢 Companies'}
                  </button>
                ))}
                <button
                  onClick={() => refetchGraph()}
                  title="Refresh Graph"
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    color: '#64748B',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ⟲
                </button>
              </div>
            </div>

            {/* Graph Loading / Error / Canvas Grid */}
            {isGraphLoading ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                  Generating interactive network graph with real-time relationship edges...
                </p>
              </div>
            ) : isGraphError ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                <p style={{ color: '#DC2626', fontWeight: 600, margin: '0 0 12px' }}>Failed to load network graph data.</p>
                <button
                  onClick={() => refetchGraph()}
                  style={{ padding: '8px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', alignItems: 'start' }}>
                {/* Visual Graph Canvas */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <NetworkGraphCanvas
                    nodes={filteredGraphNodes}
                    edges={rawGraphEdges}
                    selectedNodeId={graphSelectedNodeId}
                    onSelectNode={(nodeId) => setGraphSelectedNodeId(nodeId)}
                    height="620px"
                  />
                </div>

                {/* Right: Selected Node Inspector */}
                <div style={{
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  maxHeight: '620px',
                  overflowY: 'auto'
                }}>
                  <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6366F1' }}>
                      Node Inspector
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                      {selectedGraphNode ? selectedGraphNode.label : 'Select a node'}
                    </div>
                  </div>

                  {selectedGraphNode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: selectedGraphNode.type === 'COMPANY' ? '8px' : '50%',
                          background: selectedGraphNode.id === 'bhanu-root' ? '#6366F1' : selectedGraphNode.type === 'COMPANY' ? '#10B981' : '#2563EB',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '16px',
                          flexShrink: 0
                        }}>
                          {selectedGraphNode.type === 'COMPANY' ? '🏢' : selectedGraphNode.label.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedGraphNode.label}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedGraphNode.role && selectedGraphNode.company
                              ? `${selectedGraphNode.role} · ${selectedGraphNode.company}`
                              : selectedGraphNode.company || selectedGraphNode.role || selectedGraphNode.type}
                          </div>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: selectedGraphNode.id === 'bhanu-root' ? '#EEF2FF' : selectedGraphNode.type === 'COMPANY' ? '#ECFDF5' : selectedGraphNode.hasResearch ? '#EFF6FF' : '#F1F5F9',
                          color: selectedGraphNode.id === 'bhanu-root' ? '#4F46E5' : selectedGraphNode.type === 'COMPANY' ? '#047857' : selectedGraphNode.hasResearch ? '#1D4ED8' : '#475569',
                        }}>
                          {selectedGraphNode.id === 'bhanu-root' ? 'FOUNDER (ROOT)' : selectedGraphNode.type === 'COMPANY' ? 'ENTERPRISE COMPANY' : selectedGraphNode.hasResearch ? 'RESEARCHED CANDIDATE' : 'NETWORK CONNECTION'}
                        </span>
                      </div>

                      {/* Deep Research Action Panel */}
                      {selectedGraphNode.type === 'PERSON' && selectedGraphNode.id !== 'bhanu-root' && (
                        <div style={{ marginTop: '4px' }}>
                          {selectedGraphNode.hasResearch ? (
                            <div style={{ padding: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                                  ✅ Profile Researched
                                </span>
                                <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  READY
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: '12px', color: '#15803D', lineHeight: 1.4 }}>
                                Verified intel, career signals, and product fit are available.
                              </p>
                              <button
                                onClick={() => {
                                  const targetId = selectedGraphNode.contactId || selectedGraphNode.id.replace('conn-', '').replace('target-', '');
                                  navigate(`/people/${targetId}`);
                                }}
                                style={{
                                  marginTop: '4px',
                                  padding: '8px 12px',
                                  background: '#16A34A',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                              >
                                View Contact Details & Fit →
                              </button>
                            </div>
                          ) : (
                            <div style={{ padding: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8' }}>
                                ⚡ Unresearched Connection
                              </div>
                              <p style={{ margin: 0, fontSize: '12px', color: '#2563EB', lineHeight: 1.4 }}>
                                Run deep intelligence gathering on this connection to identify semantic product mapping and relationship pathways.
                              </p>
                              <button
                                disabled={graphResearchingId === (selectedGraphNode.contactId || selectedGraphNode.id.replace('conn-', '').replace('target-', ''))}
                                onClick={() => {
                                  const targetId = selectedGraphNode.contactId || selectedGraphNode.id.replace('conn-', '').replace('target-', '');
                                  handleGraphTriggerResearch(targetId);
                                }}
                                style={{
                                  marginTop: '4px',
                                  padding: '8px 12px',
                                  background: '#2563EB',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  opacity: graphResearchingId ? 0.7 : 1
                                }}
                              >
                                {graphResearchingId === (selectedGraphNode.contactId || selectedGraphNode.id.replace('conn-', '').replace('target-', ''))
                                  ? 'Launching Research...'
                                  : '🚀 Launch Deep Research'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Direct Relationships */}
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Connected Relationships ({connectedGraphEdges.length})
                        </div>
                        {connectedGraphEdges.length === 0 ? (
                          <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                            No direct connections in graph.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {connectedGraphEdges.slice(0, 8).map((edge, idx) => {
                              const otherId = edge.source === selectedGraphNode.id ? edge.target : edge.source;
                              const otherNode = rawGraphNodes.find(n => n.id === otherId);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setGraphSelectedNodeId(otherId)}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '6px 10px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '12px',
                                    color: '#334155'
                                  }}
                                >
                                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {otherNode ? otherNode.label : otherId}
                                  </span>
                                  <span style={{ fontSize: '10px', color: '#6366F1', fontWeight: 600, flexShrink: 0, marginLeft: '6px' }}>
                                    {edge.label || 'Connected'} →
                                  </span>
                                </button>
                              );
                            })}
                            {connectedGraphEdges.length > 8 && (
                              <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '4px' }}>
                                + {connectedGraphEdges.length - 8} more connections
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94A3B8', padding: '24px 0', fontSize: '13px' }}>
                      Click on any node in the canvas to inspect its profile and relationships.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Screen 2 Filter & Action Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Search bar */}
              <div style={{
                position: 'relative',
                flex: '1',
                minWidth: '280px',
                maxWidth: '480px'
              }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search people by name, company, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#fff',
                    color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action controls: Quick Filter, Sort, Export, View Toggle */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
                  {(['all', 'targets', 'network'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: typeFilter === t ? '#fff' : 'transparent',
                        color: typeFilter === t ? '#0F172A' : '#64748B',
                        boxShadow: typeFilter === t ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {t === 'all' ? 'All' : t === 'targets' ? 'Targets' : 'Network'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSortBy(sortBy === 'name' ? 'company' : sortBy === 'company' ? 'activity' : 'name')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowUpDown size={14} />
                  Sort: {sortBy === 'name' ? 'Name' : sortBy === 'company' ? 'Company' : 'Activity'}
                </button>

                <button
                  onClick={handleExportCSV}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} />
                  Export
                </button>

                <div style={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setDisplayFormat('table')}
                    style={{
                      padding: '7px 10px',
                      border: 'none',
                      background: displayFormat === 'table' ? '#F1F5F9' : '#fff',
                      color: displayFormat === 'table' ? '#0F172A' : '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Table View"
                  >
                    <List size={15} />
                  </button>
                  <button
                    onClick={() => setDisplayFormat('grid')}
                    style={{
                      padding: '7px 10px',
                      border: 'none',
                      borderLeft: '1px solid #E2E8F0',
                      background: displayFormat === 'grid' ? '#F1F5F9' : '#fff',
                      color: displayFormat === 'grid' ? '#0F172A' : '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Grid View"
                  >
                    <Grid size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {filteredContacts.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                borderRadius: '12px',
                background: '#fff',
                marginTop: '8px'
              }}>
                <p style={{ color: '#64748B', fontSize: '15px', margin: 0, fontWeight: 500 }}>
                  {debouncedSearch || query 
                    ? `No contacts found matching "${debouncedSearch || query}".` 
                    : viewMode === 'network'
                      ? "No network contacts matching this filter."
                      : viewMode === 'companies'
                        ? "No companies matching this filter."
                        : viewMode === 'pending'
                          ? "No profiles currently pending review. All analyzed contacts have been accepted!"
                          : "No contacts in your workspace."}
                </p>
              </div>
            ) : displayFormat === 'table' ? (
              /* Screen 2 Enterprise Data Table */
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ width: '40px', padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                          onChange={handleToggleSelectAll}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', letterSpacing: '0.04em' }}>NAME</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', letterSpacing: '0.04em' }}>TITLE / COMPANY</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', letterSpacing: '0.04em' }}>LOCATION</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', letterSpacing: '0.04em' }}>RELATIONSHIP</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', letterSpacing: '0.04em' }}>LAST ACTIVITY</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', letterSpacing: '0.04em', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => {
                      const isSelected = selectedIds.has(contact.id);
                      const isBhanu = contact.contact_type === 'BHANU_CONNECTION';
                      const isAccepted = Boolean(contact.founder_reviewed);
                      const relationshipType = isBhanu || isAccepted ? 'Strong' : (contact.contact_type === 'TARGET' ? 'Moderate' : 'Weak');
                      const relBg = relationshipType === 'Strong' ? '#DCFCE7' : relationshipType === 'Moderate' ? '#FEF3C7' : '#F1F5F9';
                      const relColor = relationshipType === 'Strong' ? '#15803D' : relationshipType === 'Moderate' ? '#B45309' : '#475569';
                      const initials = (contact.name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                      return (
                        <tr
                          key={contact.id}
                          onClick={() => navigate(`/people/${contact.id}`)}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            background: isSelected ? '#EFF6FF' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td style={{ padding: '12px 16px' }} onClick={(e) => handleToggleSelect(contact.id, e)}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: isBhanu ? 'linear-gradient(135deg, #2563EB, #4F46E5)' : '#EFF6FF',
                                color: isBhanu ? '#fff' : '#1D4ED8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '13px',
                                flexShrink: 0
                              }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                                  {contact.name || 'Unnamed Contact'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B' }}>
                                  {isAccepted ? 'In Network' : isBhanu ? 'Bhanu Network' : 'Target Prospect'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 500, color: '#1E293B' }}>{contact.title || 'Executive'}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{contact.company || 'Enterprise'}</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>
                            {(contact as any).location || 'San Francisco, CA'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '3px 9px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: relBg,
                              color: relColor
                            }}>
                              {relationshipType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px' }}>
                            {contact.lastUpdated || 'Recent'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              {!isAccepted && (
                                <>
                                  <button
                                    onClick={() => acceptMutation.mutate(contact.id)}
                                    disabled={acceptingId === contact.id}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      background: '#2563EB',
                                      color: '#fff',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {acceptingId === contact.id ? '...' : 'Accept'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDecliningId(contact.id);
                                      declineMutation.mutate(contact.id);
                                    }}
                                    disabled={decliningId === contact.id}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #E2E8F0',
                                      background: '#fff',
                                      color: '#64748B',
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {decliningId === contact.id ? '...' : 'Decline'}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => navigate(`/people/${contact.id}`)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #E2E8F0',
                                  background: '#fff',
                                  color: '#0F172A',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                View 360
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, contact.id, contact.name)}
                                disabled={deletingId === contact.id}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#94A3B8',
                                  cursor: deletingId === contact.id ? 'not-allowed' : 'pointer'
                                }}
                                title="Delete contact"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid view option */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredContacts.map(contact => {
                  const isBhanu = contact.contact_type === 'BHANU_CONNECTION';
                  const isAccepted = Boolean(contact.founder_reviewed);
                  const initials = (contact.name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const relationshipType = isBhanu || isAccepted ? 'Strong' : (contact.contact_type === 'TARGET' ? 'Moderate' : 'Weak');
                  const relBg = relationshipType === 'Strong' ? '#DCFCE7' : relationshipType === 'Moderate' ? '#FEF3C7' : '#F1F5F9';
                  const relColor = relationshipType === 'Strong' ? '#15803D' : relationshipType === 'Moderate' ? '#B45309' : '#475569';

                  return (
                    <div
                      key={contact.id}
                      onClick={() => navigate(`/people/${contact.id}`)}
                      style={{
                        padding: '18px',
                        background: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isBhanu ? 'linear-gradient(135deg, #2563EB, #4F46E5)' : '#EFF6FF',
                          color: isBhanu ? '#fff' : '#1D4ED8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{contact.name}</h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {contact.title && contact.company ? `${contact.title} · ${contact.company}` : contact.title || contact.company || 'Professional'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: relBg, color: relColor }}>
                          {relationshipType}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {(contact as any).location || 'San Francisco, CA'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{contact.lastUpdated || 'Recent'}</span>
                        <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                          {!isAccepted && (
                            <>
                              <button
                                onClick={() => acceptMutation.mutate(contact.id)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  setDecliningId(contact.id);
                                  declineMutation.mutate(contact.id);
                                }}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/people/${contact.id}`)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            360 →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </WorkspaceShell>
    </>
  );
};

