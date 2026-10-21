import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { networkApi } from '../../../services/api/network.api';

export const NetworkMap: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [researchingId, setResearchingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['networkGraph'],
    queryFn: () => networkApi.getGraph()
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'PERSON' | 'COMPANY'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const nodes = useMemo(() => data?.nodes || [], [data]);
  const edges = useMemo(() => data?.edges || [], [data]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchesType = filterType === 'ALL' || n.type === filterType;
      const matchesSearch = !searchTerm || n.label.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [nodes, filterType, searchTerm]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return nodes[0] || null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [edges, selectedNode]);

  const handleTriggerResearch = async (contactId?: string) => {
    if (!contactId) return;
    setResearchingId(contactId);
    try {
      await networkApi.triggerDeepResearch(contactId);
      await queryClient.invalidateQueries({ queryKey: ['networkGraph'] });
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      navigate(`/people/${contactId}`);
    } catch (e: any) {
      alert(`Failed to launch deep research: ${e.message || 'Unknown error'}`);
      setResearchingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '15px' }}>Loading real-time ecosystem network graph...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
        <p style={{ color: '#DC2626', fontWeight: 600, fontSize: '16px' }}>Failed to load ecosystem network graph.</p>
        <button 
          onClick={() => refetch()}
          style={{ marginTop: '12px', padding: '8px 16px', background: '#6366F1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Retry
        </button>
      </div>
    );
  }

  const personCount = data.total_people || nodes.filter(n => n.type === 'PERSON').length;
  const companyCount = data.total_companies || nodes.filter(n => n.type === 'COMPANY').length;
  const connectionCount = data.total_connections || edges.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Ecosystem & Network Intelligence</h1>
          <p className="body-text text-secondary" style={{ marginTop: '4px' }}>
            Visualizing Bhanu's imported network bridges, target enterprises, and verified pathways.
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '8px 14px', background: '#EEF2FF', borderRadius: '8px', border: '1px solid #C7D2FE', fontSize: '13px', fontWeight: 600, color: '#4338CA' }}>
            👥 {personCount} People
          </div>
          <div style={{ padding: '8px 14px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '13px', fontWeight: 600, color: '#15803D' }}>
            🏢 {companyCount} Companies
          </div>
          <div style={{ padding: '8px 14px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '13px', fontWeight: 600, color: '#B45309' }}>
            ⚡ {connectionCount} Connections
          </div>
        </div>
      </div>

      {/* Main Graph & Inspector Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', minHeight: 0 }}>
        {/* Left: Network Canvas Explorer */}
        <div style={{ 
          background: '#FAFAFA', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '16px',
          overflow: 'hidden'
        }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <input 
              type="text"
              placeholder="Search person or company across all connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px' }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['ALL', 'PERSON', 'COMPANY'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterType === t ? 'var(--color-brand-primary)' : '#F1F5F9',
                    color: filterType === t ? '#fff' : '#64748B'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Nodes Interactive Cluster */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '12px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
            gap: '12px',
            alignContent: 'start'
          }}>
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isBhanu = node.id === 'bhanu-root';
              const isCompany = node.type === 'COMPANY';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    padding: '14px',
                    background: isBhanu ? '#4F46E5' : isSelected ? '#EFF6FF' : '#fff',
                    color: isBhanu ? '#fff' : '#1E293B',
                    border: isSelected ? '2px solid #3B82F6' : '1px solid var(--color-border)',
                    borderRadius: isCompany ? '10px' : '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      letterSpacing: '0.5px',
                      color: isBhanu ? 'rgba(255,255,255,0.8)' : isCompany ? '#059669' : '#6366F1' 
                    }}>
                      {isBhanu ? 'FOUNDER' : node.type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {node.hasResearch && (
                        <span style={{ fontSize: '9px', fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px' }}>
                          RESEARCHED
                        </span>
                      )}
                      {isCompany && <span style={{ fontSize: '14px' }}>🏢</span>}
                      {!isCompany && !isBhanu && <span style={{ fontSize: '14px' }}>👤</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.label}
                  </div>
                  {node.company && (
                    <div style={{ fontSize: '12px', color: isBhanu ? 'rgba(255,255,255,0.7)' : '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.company}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Relationship & Node Inspector */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            Entity Details
          </h2>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: selectedNode.type === 'COMPANY' ? '8px' : '50%',
                  background: selectedNode.id === 'bhanu-root' ? '#4F46E5' : selectedNode.type === 'COMPANY' ? '#10B981' : '#6366F1',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {selectedNode.type === 'COMPANY' ? '🏢' : selectedNode.label.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedNode.label}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {selectedNode.role && selectedNode.company ? `${selectedNode.role} · ${selectedNode.company}` : selectedNode.role || selectedNode.company || selectedNode.type}
                  </div>
                </div>
              </div>

              {/* Deep Research Action Panel (For Person Nodes) */}
              {selectedNode.type === 'PERSON' && selectedNode.id !== 'bhanu-root' && (
                <div style={{ marginTop: '4px' }}>
                  {selectedNode.hasResearch ? (
                    <div style={{ padding: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✅ Deep Researched
                        </span>
                        <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {selectedNode.researchStatus || 'READY'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#15803D', lineHeight: 1.4 }}>
                        Full multi-source intelligence, verified evidence, and opportunity signals are active for this profile.
                      </p>
                      <button
                        onClick={() => {
                          const targetId = selectedNode.contactId || selectedNode.id.replace('conn-', '').replace('target-', '');
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
                        Open in People / Relationships →
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚡ Network Pool (Unresearched)
                        </span>
                        {selectedNode.relationshipStrength && (
                          <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 600 }}>
                            ★ {selectedNode.relationshipStrength}/5
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#B45309', lineHeight: 1.4 }}>
                        To present this connection in People & Relationships, launch automated multi-source deep research.
                      </p>
                      <button
                        disabled={researchingId === (selectedNode.contactId || selectedNode.id.replace('conn-', '').replace('target-', ''))}
                        onClick={() => {
                          const targetId = selectedNode.contactId || selectedNode.id.replace('conn-', '').replace('target-', '');
                          handleTriggerResearch(targetId);
                        }}
                        style={{
                          marginTop: '4px',
                          padding: '9px 12px',
                          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: researchingId === (selectedNode.contactId || selectedNode.id.replace('conn-', '').replace('target-', '')) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(99,102,241,0.25)'
                        }}
                      >
                        {researchingId === (selectedNode.contactId || selectedNode.id.replace('conn-', '').replace('target-', '')) ? (
                          <span>Launching Multi-Source Research...</span>
                        ) : (
                          <>
                            <span>🚀 Initiate Deep Research</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Pathways / Linked Edges */}
              <div style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: '13px', margin: '0 0 10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Connected Pathways ({connectedEdges.length})
                </h4>

                {connectedEdges.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No direct edges mapped yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {connectedEdges.map((e, idx) => {
                      const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                      const otherNode = nodes.find(n => n.id === otherNodeId);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedNodeId(otherNodeId)}
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: '8px', 
                            background: '#F8FAFC', 
                            border: '1px solid #E2E8F0',
                            fontSize: '13px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#6366F1';
                            e.currentTarget.style.backgroundColor = '#EEF2FF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>
                            {otherNode?.label || otherNodeId}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6366F1', fontWeight: 500 }}>
                            🔗 {e.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Select an entity on the left to inspect pathways.</p>
          )}
        </div>
      </div>
    </div>
  );
};
