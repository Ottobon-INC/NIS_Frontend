import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Zap,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  Building,
  RefreshCw
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useProblemsBoard } from '../../../hooks/useProblemsBoard';
import type { ProblemBoardItem, NetworkSolverItem } from '../../../services/api/matching.api';

export const ProblemsBoardWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading, isError, refetch } = useProblemsBoard();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EVIDENCE_GROUNDED' | 'SUPPORTED_INFERENCE'>('ALL');
  const [solversOnly, setSolversOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProblemBoardItem | null>(null);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Text search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = item.contact_name.toLowerCase().includes(q);
        const matchesCompany = item.contact_company.toLowerCase().includes(q);
        const matchesTitle = item.contact_title.toLowerCase().includes(q);
        const matchesProblem = (item.broad_business_problem || '').toLowerCase().includes(q);
        const matchesSmallest = (item.smallest_solvable_problem || '').toLowerCase().includes(q);
        const matchesCapability = (item.ottobon_solvable_way?.capability || '').toLowerCase().includes(q);
        const matchesSolvers = item.network_solvers.some(
          (s) =>
            s.solver_name.toLowerCase().includes(q) ||
            s.solver_company.toLowerCase().includes(q) ||
            s.solver_title.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCompany && !matchesTitle && !matchesProblem && !matchesSmallest && !matchesCapability && !matchesSolvers) {
          return false;
        }
      }

      // 2. Epistemic status filter
      if (statusFilter !== 'ALL') {
        if (item.epistemic_status !== statusFilter) {
          return false;
        }
      }

      // 3. Solvers only filter
      if (solversOnly && item.network_solvers.length === 0) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, solversOnly]);

  // Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const grounded = items.filter((i) => i.epistemic_status === 'EVIDENCE_GROUNDED').length;
    const withNetworkSolvers = items.filter((i) => i.network_solvers.length > 0).length;
    const totalSolversDiscovered = items.reduce((acc, i) => acc + i.network_solvers.length, 0);

    return { total, grounded, withNetworkSolvers, totalSolversDiscovered };
  }, [items]);

  return (
    <WorkspaceShell
      title="Problems &amp; Solvers Board"
      subtitle="Catalog of researched people problems paired with dual solvable paths: Ottobon internal capability sprints &amp; connection solver superpowers."
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: 'Problems & Solvers', path: '/problems' }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && items.length === 0}
      emptyStateMessage="No researched problems cataloged yet. Complete person research runs to populate problem intelligence."
      headerActions={
        <button
          type="button"
          onClick={() => refetch()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          Refresh Board
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Metric Cards Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Researched Problems</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{metrics.total}</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Operational bottlenecks identified</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Grounded In Evidence</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>{metrics.grounded}</div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>Zero-hallucination factual proof</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #DDD6FE', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B21A8', textTransform: 'uppercase' }}>Network Solvable (X &rarr; Y)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>{metrics.withNetworkSolvers}</div>
            <div style={{ fontSize: '11px', color: '#6B21A8', marginTop: '2px' }}>Problems solvable by existing connections</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0369A1', textTransform: 'uppercase' }}>Connection Solvers Matched</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284C7', marginTop: '4px' }}>{metrics.totalSolversDiscovered}</div>
            <div style={{ fontSize: '11px', color: '#0369A1', marginTop: '2px' }}>Total solver introduction alignments</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '460px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by person, company, problem, or solver superpower..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              <Filter size={13} /> Status:
            </div>
            {(['ALL', 'EVIDENCE_GROUNDED', 'SUPPORTED_INFERENCE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: statusFilter === st ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: statusFilter === st ? '#EFF6FF' : '#FFFFFF',
                  color: statusFilter === st ? '#1D4ED8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'ALL' ? 'All Proof Tiers' : st === 'EVIDENCE_GROUNDED' ? 'Evidence Grounded' : 'Supported Inference'}
              </button>
            ))}

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', marginLeft: '10px' }}>
              <input
                type="checkbox"
                checked={solversOnly}
                onChange={(e) => setSolversOnly(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Has Network Solvers Only
            </label>
          </div>
        </div>

        {/* Problem & Solvers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <AlertCircle size={28} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B' }}>No matching problems found</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Try broadening your search query or adjusting the filters above.</div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isGrounded = item.epistemic_status === 'EVIDENCE_GROUNDED';
              const hasSolvers = item.network_solvers.length > 0;

              return (
                <div
                  key={item.contact_id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '24px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}
                >
                  {/* Top Bar: Contact Info & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/contacts/${item.contact_id}`)}
                          style={{
                            fontSize: '17px',
                            fontWeight: 800,
                            color: '#0F172A',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                          title="View Contact 360 Workspace"
                        >
                          {item.contact_name}
                        </button>

                        {item.linkedin_url && (
                          <a
                            href={item.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center' }}
                            title="Open LinkedIn Profile"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}

                        {/* Epistemic Status Pill */}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isGrounded ? '#ECFDF5' : '#EFF6FF',
                            color: isGrounded ? '#047857' : '#1D4ED8',
                            border: `1px solid ${isGrounded ? '#A7F3D0' : '#BFDBFE'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isGrounded ? <ShieldCheck size={11} color="#059669" /> : <Sparkles size={11} color="#2563EB" />}
                          {isGrounded ? 'EVIDENCE GROUNDED' : 'SUPPORTED INFERENCE'}
                        </span>

                        {/* Tier Pill */}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          {item.contact_tier}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '13px', color: '#475569' }}>
                        <Building size={13} color="#64748B" />
                        <span><strong>{item.contact_title}</strong> at <strong>{item.contact_company}</strong></span>
                        {item.contact_location && <span style={{ color: '#94A3B8' }}>&bull; {item.contact_location}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/contacts/${item.contact_id}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Contact 360 <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Problem Description Card */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Identified Operational Problem
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginTop: '4px', lineHeight: '1.5' }}>
                        {item.broad_business_problem || item.smallest_solvable_problem}
                      </div>
                    </div>

                    {item.smallest_solvable_problem && item.smallest_solvable_problem !== item.broad_business_problem && (
                      <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase' }}>
                          Scoped 4-Week Pilot Angle
                        </div>
                        <div style={{ fontSize: '13px', color: '#0369A1', marginTop: '2px' }}>
                          {item.smallest_solvable_problem}
                        </div>
                      </div>
                    )}

                    {item.why_now && (
                      <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                        <strong>Why Now:</strong> {item.why_now}
                      </div>
                    )}
                  </div>

                  {/* Dual Solvable Ways Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    
                    {/* SOLVABLE WAY 1: OTTOBON INTERNAL CAPABILITY */}
                    <div
                      style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: '10px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Zap size={15} color="#15803D" />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Way 1: Ottobon Product / Pilot Sprint
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#14532D' }}>
                          {item.ottobon_solvable_way.capability}
                        </div>

                        <div style={{ fontSize: '12px', color: '#166534', marginTop: '6px', lineHeight: '1.4' }}>
                          <strong>Proposed Sprint:</strong> {item.ottobon_solvable_way.proposed_sprint}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            Risk: {item.ottobon_solvable_way.delivery_risk}
                          </span>
                          <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                            {item.ottobon_solvable_way.cost_pricing_estimate}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #DCFCE7', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/contacts/${item.contact_id}`)}
                          style={{
                            background: '#15803D',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Target size={13} />
                          Scope Proposal
                        </button>
                      </div>
                    </div>

                    {/* SOLVABLE WAY 2: NETWORK CONNECTION SOLVERS (X -> Y) */}
                    <div
                      style={{
                        background: '#FAF5FF',
                        border: '1px solid #E9D5FF',
                        borderRadius: '10px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={15} color="#7C3AED" />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Way 2: Network Solvers ({item.network_solvers.length})
                            </span>
                          </div>

                          {hasSolvers && (
                            <span style={{ fontSize: '11px', background: '#F3E8FF', color: '#7E22CE', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                              X &rarr; Y Solvable
                            </span>
                          )}
                        </div>

                        {hasSolvers ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {item.network_solvers.slice(0, 3).map((solver: NetworkSolverItem) => (
                              <div
                                key={solver.solver_contact_id}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1px solid #E9D5FF',
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/contacts/${solver.solver_contact_id}`)}
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        color: '#6B21A8',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                      }}
                                    >
                                      {solver.solver_name}
                                    </button>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        background: solver.match_strength === 'STRONG' ? '#DDD6FE' : '#F1F5F9',
                                        color: solver.match_strength === 'STRONG' ? '#5B21B6' : '#64748B'
                                      }}
                                    >
                                      {solver.match_strength}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                                    {solver.solver_title} at {solver.solver_company}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#7C3AED', marginTop: '2px', fontStyle: 'italic' }}>
                                    {solver.solver_reason}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => navigate(`/contacts/${solver.solver_contact_id}`)}
                                  style={{
                                    fontSize: '11px',
                                    color: '#7C3AED',
                                    background: '#F5F3FF',
                                    border: '1px solid #DDD6FE',
                                    borderRadius: '5px',
                                    padding: '4px 8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  View 360
                                </button>
                              </div>
                            ))}

                            {item.network_solvers.length > 3 && (
                              <button
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#7C3AED',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  padding: '4px 0',
                                  textAlign: 'left'
                                }}
                              >
                                + View {item.network_solvers.length - 3} more candidate solvers...
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#9333EA', fontStyle: 'italic', padding: '10px 0' }}>
                            No current connections with matching superpower profile detected. Run research on additional connections to expand solver coverage.
                          </div>
                        )}
                      </div>

                      {hasSolvers && (
                        <div style={{ borderTop: '1px solid #F3E8FF', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            style={{
                              background: '#7C3AED',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Users size={13} />
                            All {item.network_solvers.length} Solvers
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal for All Network Solvers */}
        {selectedItem && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
            onClick={() => setSelectedItem(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                maxWidth: '680px',
                width: '100%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    Network Solvers for {selectedItem.contact_name}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {selectedItem.network_solvers.length} connections equipped to solve this operational problem
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748B', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Target Problem</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                    {selectedItem.broad_business_problem}
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginTop: '8px' }}>
                  Candidate Solvers in Network
                </div>

                {selectedItem.network_solvers.map((s) => (
                  <div
                    key={s.solver_contact_id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{s.solver_name}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: s.match_strength === 'STRONG' ? '#DDD6FE' : '#F1F5F9',
                            color: s.match_strength === 'STRONG' ? '#5B21B6' : '#64748B'
                          }}
                        >
                          {s.match_strength} MATCH
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        {s.solver_title} at {s.solver_company}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7C3AED', marginTop: '4px' }}>
                        <strong>Alignment:</strong> {s.solver_reason}
                      </div>
                      {s.core_strengths.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {s.core_strengths.map((cs, idx) => (
                            <span key={idx} style={{ fontSize: '10px', background: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                              {cs}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(null);
                        navigate(`/contacts/${s.solver_contact_id}`);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View 360 Profile
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
};
