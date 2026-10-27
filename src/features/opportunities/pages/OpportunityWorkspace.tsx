import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  List, 
  Grid,
  ChevronRight,
  CheckSquare,
  Square,
  Building2
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunitySearch, useCreateOpportunity, useDeriveOpportunity } from '../../../hooks/useOpportunities';
import { useContacts } from '../../../hooks/useContacts';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';

export const OpportunityWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_ANALYSIS' | 'VALIDATED' | 'IN_PROGRESS' | 'CLOSED'>('ALL');
  const [displayFormat, setDisplayFormat] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'title' | 'company' | 'updated'>('updated');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'DERIVE' | 'MANUAL'>('DERIVE');

  // Search and Facet state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  // Debounce search query changes by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Derivation state
  const [selectedContactId, setSelectedContactId] = useState('');

  // Manual form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualProblem, setManualProblem] = useState('');
  const [manualRequirement, setManualRequirement] = useState('');
  const [manualType, setManualType] = useState('Digital Transformation');
  const [manualConfidence, setManualConfidence] = useState(75);
  const [manualTimeline, setManualTimeline] = useState('');
  const [manualBudget, setManualBudget] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Live PostgreSQL-backed search query
  const isFiltering = !!debouncedSearchQuery || selectedCategory !== 'ALL' || minConfidence > 0;

  const { data: searchData, isLoading, isError } = useOpportunitySearch({
    q: debouncedSearchQuery || undefined,
    opportunity_type: selectedCategory === 'ALL' ? undefined : selectedCategory,
    min_confidence: minConfidence > 0 ? minConfidence : undefined,
  });

  const allOpps = useMemo(() => searchData?.results || [], [searchData]);
  const inAnalysisCount = useMemo(() => allOpps.filter(o => o.status === 'CANDIDATE' || (o.status as string) === 'IN_ANALYSIS').length, [allOpps]);
  const validatedCount = useMemo(() => allOpps.filter(o => o.status === 'VALIDATED').length, [allOpps]);
  const inProgressCount = useMemo(() => allOpps.filter(o => o.status === 'SOLUTION_MATCHING' || o.status === 'PATH_DEFINED' || o.status === 'PIPELINE' || (o.status as string) === 'IN_PROGRESS').length, [allOpps]);
  const closedCount = useMemo(() => allOpps.filter(o => o.status === 'OUTCOME' || o.status === 'REJECTED' || o.status === 'EXPIRED' || (o.status as string) === 'CLOSED' || (o.status as string) === 'ARCHIVED').length, [allOpps]);
  const totalCount = searchData?.total ?? allOpps.length;

  const opportunities = useMemo(() => {
    let list = allOpps;
    if (activeTab === 'IN_ANALYSIS') {
      list = allOpps.filter(o => o.status === 'CANDIDATE' || (o.status as string) === 'IN_ANALYSIS');
    } else if (activeTab === 'VALIDATED') {
      list = allOpps.filter(o => o.status === 'VALIDATED');
    } else if (activeTab === 'IN_PROGRESS') {
      list = allOpps.filter(o => o.status === 'SOLUTION_MATCHING' || o.status === 'PATH_DEFINED' || o.status === 'PIPELINE' || (o.status as string) === 'IN_PROGRESS');
    } else if (activeTab === 'CLOSED') {
      list = allOpps.filter(o => o.status === 'OUTCOME' || o.status === 'REJECTED' || o.status === 'EXPIRED' || (o.status as string) === 'CLOSED' || (o.status as string) === 'ARCHIVED');
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'company') return a.companyName.localeCompare(b.companyName);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [allOpps, activeTab, sortBy]);


  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveTab('ALL');
    setSelectedCategory('ALL');
    setMinConfidence(0);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === opportunities.length && opportunities.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(opportunities.map(o => o.id)));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    const listToExport = selectedIds.size > 0 
      ? opportunities.filter(o => selectedIds.has(o.id))
      : opportunities;
    const headers = ['Title', 'Company', 'Stage', 'Type', 'Confidence', 'Problem', 'Requirement', 'Updated'];
    const rows = listToExport.map(o => [
      `"${(o.title || '').replace(/"/g, '""')}"`,
      `"${(o.companyName || '').replace(/"/g, '""')}"`,
      `"${(o.status || '').replace(/"/g, '""')}"`,
      `"${(o.opportunityType || '').replace(/"/g, '""')}"`,
      o.confidence,
      `"${(o.problem || '').replace(/"/g, '""')}"`,
      `"${(o.requirement || '').replace(/"/g, '""')}"`,
      o.updatedAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `opportunities_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { data: contactsList, isLoading: isContactsLoading } = useContacts();
  const deriveMutation = useDeriveOpportunity();
  const createMutation = useCreateOpportunity();

  const handleDeriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedContactId) {
      setFormError('Please select a contact to derive an opportunity from.');
      return;
    }

    try {
      const newOpp = await deriveMutation.mutateAsync(selectedContactId);
      setShowCreateModal(false);
      setSelectedContactId('');
      navigate(`/opportunities/${newOpp.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to derive opportunity from contact.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!manualTitle.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!manualCompany.trim()) {
      setFormError('Target company name is required.');
      return;
    }
    if (!manualProblem.trim()) {
      setFormError('Problem statement is required.');
      return;
    }
    if (!manualRequirement.trim()) {
      setFormError('Requirement statement is required.');
      return;
    }

    try {
      const newOpp = await createMutation.mutateAsync({
        title: manualTitle.trim(),
        company_name: manualCompany.trim(),
        problem: manualProblem.trim(),
        requirement: manualRequirement.trim(),
        opportunity_type: manualType.trim(),
        confidence: Number(manualConfidence),
        timeline: manualTimeline.trim() || undefined,
        budget_signal: manualBudget.trim() || undefined,
      });
      setShowCreateModal(false);
      // Reset form
      setManualTitle('');
      setManualCompany('');
      setManualProblem('');
      setManualRequirement('');
      setManualTimeline('');
      setManualBudget('');
      navigate(`/opportunities/${newOpp.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create opportunity.');
    }
  };

  const isSubmitting = deriveMutation.isPending || createMutation.isPending;

  return (
    <WorkspaceShell
      title="Opportunities"
      subtitle="Business opportunities from your network"
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' }
      ]}
      primaryAction={{
        label: '+ Add Opportunity',
        onClick: () => {
          setFormError(null);
          setShowCreateModal(true);
        }
      }}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && opportunities.length === 0}
      emptyStateMessage={
        isFiltering
          ? 'No commercial opportunities match the specified search and filter criteria.'
          : 'No commercial opportunities detected. Establish more Trusted Context or create an opportunity.'
      }
    >
      {/* Screen 4: Segmented Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '20px',
        paddingBottom: '0'
      }}>
        {[
          { key: 'ALL', label: 'All Opportunities', count: totalCount },
          { key: 'IN_ANALYSIS', label: 'In Analysis', count: inAnalysisCount },
          { key: 'VALIDATED', label: 'Validated', count: validatedCount },
          { key: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
          { key: 'CLOSED', label: 'Closed', count: closedCount },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2563EB' : '#64748B',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '10px',
                background: isActive ? '#EFF6FF' : '#F1F5F9',
                color: isActive ? '#1D4ED8' : '#64748B'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Screen 4: Filter & Action Toolbar */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Search input */}
        <div style={{ position: 'relative', minWidth: '320px', flex: '1 1 320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search opportunities by title, problem, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              background: '#F8FAFC',
              color: '#0F172A',
              outline: 'none',
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
                fontSize: '16px'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Right: Facet filters, sorting, export, and table/grid view */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              background: '#FFFFFF',
              color: '#334155',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="JOB_OPENING">Job Openings</option>
            <option value="ENTERPRISE_AI_PILOT">Enterprise AI Pilot</option>
            <option value="STRATEGIC_INTELLIGENCE">Strategic Intelligence</option>
            <option value="PREDICTIVE_LOGISTICS">Predictive Logistics</option>
            <option value="DATA_MODERNIZATION">Data Modernization</option>
            <option value="Digital Transformation">Digital Transformation</option>
          </select>

          {/* Confidence Filter */}
          <select
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              background: '#FFFFFF',
              color: '#334155',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={0}>Any Confidence</option>
            <option value={50}>Confidence ≥ 50%</option>
            <option value={70}>Confidence ≥ 70%</option>
            <option value={85}>Confidence ≥ 85%</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              background: '#FFFFFF',
              color: '#334155',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="updated">Sort: Recently Updated</option>
            <option value="title">Sort: Title</option>
            <option value="company">Sort: Company</option>
          </select>

          {/* Reset Filters if active */}
          {isFiltering && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed #CBD5E1',
                background: '#F8FAFC',
                color: '#64748B',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Reset Filters
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Export filtered opportunities to CSV"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Table / Grid Switcher */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#F1F5F9',
            borderRadius: '8px',
            padding: '3px'
          }}>
            <button
              onClick={() => setDisplayFormat('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: displayFormat === 'table' ? '#FFFFFF' : 'transparent',
                color: displayFormat === 'table' ? '#0F172A' : '#64748B',
                boxShadow: displayFormat === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <List size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setDisplayFormat('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: displayFormat === 'grid' ? '#FFFFFF' : 'transparent',
                color: displayFormat === 'grid' ? '#0F172A' : '#64748B',
                boxShadow: displayFormat === 'grid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <Grid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Action Pill */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '16px',
          color: '#1E40AF',
          fontSize: '13px',
          fontWeight: 500
        }}>
          <span>{selectedIds.size} of {opportunities.length} opportunities selected</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExportCSV}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #93C5FD',
                background: '#FFFFFF',
                color: '#1D4ED8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#1E40AF',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Screen 4: Enterprise Data Table View */}
      {displayFormat === 'table' && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ width: '40px', padding: '12px 16px' }}>
                    <div 
                      onClick={handleToggleSelectAll} 
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {selectedIds.size === opportunities.length && opportunities.length > 0 ? (
                        <CheckSquare size={16} color="#2563EB" />
                      ) : (
                        <Square size={16} color="#94A3B8" />
                      )}
                    </div>
                  </th>
                  <th style={{ padding: '12px 16px' }}>Title & Problem Statement</th>
                  <th style={{ padding: '12px 16px' }}>Company / Source</th>
                  <th style={{ padding: '12px 16px' }}>Stage</th>
                  <th style={{ padding: '12px 16px' }}>Priority</th>
                  <th style={{ padding: '12px 16px' }}>Confidence</th>
                  <th style={{ padding: '12px 16px' }}>Updated</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => {
                  const isSelected = selectedIds.has(opp.id);
                  
                  // Stage config
                  let stageBg = '#EFF6FF';
                  let stageColor = '#1D4ED8';
                  let stageBorder = '#DBEAFE';
                  let stageLabel = 'In Analysis';
                  if (opp.status === 'VALIDATED') {
                    stageBg = '#ECFDF5';
                    stageColor = '#047857';
                    stageBorder = '#A7F3D0';
                    stageLabel = 'Validated';
                  } else if (opp.status === 'SOLUTION_MATCHING' || opp.status === 'PATH_DEFINED' || opp.status === 'PIPELINE' || (opp.status as string) === 'IN_PROGRESS') {
                    stageBg = '#FFF7ED';
                    stageColor = '#C2410C';
                    stageBorder = '#FFEDD5';
                    stageLabel = 'In Progress';
                  } else if (opp.status === 'OUTCOME' || opp.status === 'REJECTED' || opp.status === 'EXPIRED' || (opp.status as string) === 'CLOSED' || (opp.status as string) === 'ARCHIVED') {
                    stageBg = '#F1F5F9';
                    stageColor = '#475569';
                    stageBorder = '#E2E8F0';
                    stageLabel = 'Closed';
                  }

                  // Priority config based on confidence
                  let priorityLabel = 'Low';
                  let prioBg = '#F1F5F9';
                  let prioColor = '#64748B';
                  let prioBorder = '#E2E8F0';
                  if (opp.confidence >= 85) {
                    priorityLabel = 'High';
                    prioBg = '#FEF2F2';
                    prioColor = '#B91C1C';
                    prioBorder = '#FEE2E2';
                  } else if (opp.confidence >= 60) {
                    priorityLabel = 'Medium';
                    prioBg = '#FEF3C7';
                    prioColor = '#B45309';
                    prioBorder = '#FDE68A';
                  }

                  return (
                    <tr
                      key={opp.id}
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        background: isSelected ? '#F0F9FF' : '#FFFFFF',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px' }} onClick={(e) => handleToggleSelect(opp.id, e)}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {isSelected ? (
                            <CheckSquare size={16} color="#2563EB" />
                          ) : (
                            <Square size={16} color="#CBD5E1" />
                          )}
                        </div>
                      </td>

                      {/* Title & Problem Preview */}
                      <td style={{ padding: '14px 16px', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>
                            {opp.title}
                          </span>
                          <span style={{
                            color: '#64748B',
                            fontSize: '12px',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {opp.problem}
                          </span>
                          {opp.opportunityType === 'JOB_OPENING' && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              width: 'fit-content',
                              marginTop: '2px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#4338CA',
                              background: '#F5F3FF',
                              border: '1px solid #DDD6FE',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              Job Opening
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company / Source */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1E293B' }}>
                            <Building2 size={14} color="#64748B" />
                            <span>{opp.companyName}</span>
                          </div>
                          {opp.personName && (
                            <span style={{ color: '#64748B', fontSize: '12px', paddingLeft: '20px' }}>
                              via {opp.personName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stage Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: stageBg,
                          color: stageColor,
                          border: `1px solid ${stageBorder}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {stageLabel}
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: prioBg,
                          color: prioColor,
                          border: `1px solid ${prioBorder}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {priorityLabel} Priority
                        </span>
                      </td>

                      {/* Confidence */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '42px',
                            height: '6px',
                            background: '#E2E8F0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${opp.confidence}%`,
                              height: '100%',
                              background: opp.confidence >= 80 ? '#10B981' : opp.confidence >= 60 ? '#F59E0B' : '#94A3B8',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            {opp.confidence}%
                          </span>
                        </div>
                      </td>

                      {/* Updated Date */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(opp.updatedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: '#2563EB',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          View Details
                          <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screen 4: Grid Cards View */}
      {displayFormat === 'grid' && opportunities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {opportunities.map(opp => (
            <div 
              key={opp.id} 
              onClick={() => navigate(`/opportunities/${opp.id}`)}
              style={{ 
                background: '#FFFFFF', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '1px solid #E2E8F0', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px', 
                transition: 'all 0.2s ease', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{opp.title}</h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    {opp.personName || 'Unassigned Executive'} · <strong>{opp.companyName}</strong>
                  </p>
                </div>
                {opp.status === 'VALIDATED' ? (
                  <span style={{ color: '#047857', background: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #A7F3D0', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700 }}>
                    VALIDATED
                  </span>
                ) : (
                  <span style={{ color: '#1D4ED8', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #DBEAFE', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700 }}>
                    IN ANALYSIS
                  </span>
                )}
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 600 }}>
                  Need / Problem
                </p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#1E293B' }}>
                  {opp.problem}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 600 }}>
                  Requirement
                </p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#334155' }}>
                  {opp.requirement}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrustBadge level={opp.status === 'VALIDATED' ? 'CONFIRMED' : 'INFERENCE'} />
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Confidence {opp.confidence}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: opp.opportunityType === 'JOB_OPENING' ? '#4338CA' : '#64748B',
                    background: opp.opportunityType === 'JOB_OPENING' ? '#F5F3FF' : '#F8FAFC',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: opp.opportunityType === 'JOB_OPENING' ? '1px solid #DDD6FE' : '1px solid #E2E8F0',
                    fontWeight: opp.opportunityType === 'JOB_OPENING' ? 600 : 400
                  }}>
                    {opp.opportunityType === 'JOB_OPENING' ? 'Job Opening' : opp.opportunityType}
                  </span>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {new Date(opp.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Creation Modal */}
      {showCreateModal && (
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
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'var(--space-7)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  Create Opportunity
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Derive from researched contact intelligence or create a custom opportunity.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748B' }}
              >
                &times;
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={() => { setCreationMode('DERIVE'); setFormError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: creationMode === 'DERIVE' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
                  padding: '8px 12px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: creationMode === 'DERIVE' ? 'var(--color-brand-primary)' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                Derive from Contact Intelligence
              </button>
              <button
                type="button"
                onClick={() => { setCreationMode('MANUAL'); setFormError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: creationMode === 'MANUAL' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
                  padding: '8px 12px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: creationMode === 'MANUAL' ? 'var(--color-brand-primary)' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                Manual Definition
              </button>
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)',
                color: '#991B1B',
                fontSize: '13px'
              }}>
                {formError}
              </div>
            )}

            {/* Derive Mode */}
            {creationMode === 'DERIVE' ? (
              <form onSubmit={handleDeriveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Select Researched Contact:
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    disabled={isContactsLoading || isSubmitting}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#fff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Choose a contact --</option>
                    {contactsList?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.title} at {c.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  padding: 'var(--space-4)',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: '1.5'
                }}>
                  <strong>How Derivation Works:</strong> NetworkOS extracts the verified problem statement from the contact's dossier, performs semantic product matching against Ottobon's capability catalog, attributes authentic evidence IDs from PostgreSQL, and records an opportunity in <strong>CANDIDATE</strong> state awaiting your validation.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedContactId || isSubmitting}
                    style={{
                      padding: '8px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-brand-primary)',
                      color: '#fff',
                      border: 'none',
                      cursor: !selectedContactId || isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: !selectedContactId || isSubmitting ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? 'Deriving Opportunity...' : 'Derive Opportunity'}
                  </button>
                </div>
              </form>
            ) : (
              /* Manual Mode */
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Acme Corp Cloud Modernization"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Target Company Name *
                  </label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="e.g. Acme Technologies"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Opportunity Type
                    </label>
                    <input
                      type="text"
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value)}
                      placeholder="e.g. Digital Transformation"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Confidence ({manualConfidence}%)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={manualConfidence}
                      onChange={(e) => setManualConfidence(Number(e.target.value))}
                      style={{ width: '100%', marginTop: '8px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Underlying Problem Statement *
                  </label>
                  <textarea
                    rows={2}
                    value={manualProblem}
                    onChange={(e) => setManualProblem(e.target.value)}
                    placeholder="Describe the operational pain point or business challenge..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Capability Requirement *
                  </label>
                  <textarea
                    rows={2}
                    value={manualRequirement}
                    onChange={(e) => setManualRequirement(e.target.value)}
                    placeholder="Describe what solution or service is required..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Timeline Signal
                    </label>
                    <input
                      type="text"
                      value={manualTimeline}
                      onChange={(e) => setManualTimeline(e.target.value)}
                      placeholder="e.g. Q3/Q4 2026"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Budget Signal
                    </label>
                    <input
                      type="text"
                      value={manualBudget}
                      onChange={(e) => setManualBudget(e.target.value)}
                      placeholder="e.g. $15k-$25k initial package"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-brand-primary)',
                      color: '#fff',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Opportunity'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
