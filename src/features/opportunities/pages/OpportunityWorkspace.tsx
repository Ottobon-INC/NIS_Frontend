import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunities, useCreateOpportunity, useDeriveOpportunity } from '../../../hooks/useOpportunities';
import { useContacts } from '../../../hooks/useContacts';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';

export const OpportunityWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'CANDIDATE' | 'VALIDATED'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'DERIVE' | 'MANUAL'>('DERIVE');

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

  // Queries & Mutations
  const { data, isLoading, isError } = useOpportunities(
    selectedStatus === 'ALL' ? undefined : { status: selectedStatus }
  );
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
      title="Opportunity Intelligence"
      subtitle="Identify, review, and define business opportunities derived from verified contacts and trusted context."
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' }
      ]}
      primaryAction={{
        label: '+ New Opportunity',
        onClick: () => {
          setFormError(null);
          setShowCreateModal(true);
        }
      }}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!data?.opportunities || data.opportunities.length === 0)}
      emptyStateMessage={
        selectedStatus === 'ALL'
          ? 'No commercial opportunities detected. Establish more Trusted Context or create an opportunity.'
          : `No opportunities found with status "${selectedStatus}".`
      }
    >
      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['ALL', 'CANDIDATE', 'VALIDATED'] as const).map((st) => {
            const isActive = selectedStatus === st;
            const label = st === 'ALL' ? 'All Opportunities' : st === 'CANDIDATE' ? 'Review Pending (Candidate)' : 'Validated';
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                  background: isActive ? 'var(--color-brand-primary)' : '#fff',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {data && (
          <div className="metadata text-secondary">
            Showing {data.opportunities.length} of {data.total} {data.total === 1 ? 'opportunity' : 'opportunities'}
          </div>
        )}
      </div>

      {/* Opportunity Cards Grid */}
      {data && data.opportunities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
          {data.opportunities.map(opp => (
            <div 
              key={opp.id} 
              onClick={() => navigate(`/opportunities/${opp.id}`)}
              style={{ 
                background: '#fff', 
                padding: 'var(--space-6)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--color-border)', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--space-4)', 
                transition: 'all 0.2s ease', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="card-title" style={{ margin: '0 0 var(--space-1) 0', fontSize: '16px' }}>{opp.title}</h3>
                  <p className="body-text text-secondary" style={{ margin: 0, fontSize: '13px' }}>
                    {opp.personName || 'Unassigned Executive'} · <strong>{opp.companyName}</strong>
                  </p>
                </div>
                {opp.status === 'CANDIDATE' ? (
                  <span className="labels" style={{ color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700 }}>
                    REVIEW PENDING
                  </span>
                ) : opp.status === 'VALIDATED' ? (
                  <span className="labels" style={{ color: '#047857', background: '#ecfdf5', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700 }}>
                    VALIDATED
                  </span>
                ) : (
                  <span className="labels" style={{ color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700 }}>
                    {opp.status}
                  </span>
                )}
              </div>

              <div>
                <p className="labels text-secondary" style={{ margin: '0 0 var(--space-1) 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Need / Problem
                </p>
                <p className="body-text" style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#1e293b' }}>
                  {opp.problem}
                </p>
              </div>

              <div>
                <p className="labels text-secondary" style={{ margin: '0 0 var(--space-1) 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Requirement
                </p>
                <p className="body-text" style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#334155' }}>
                  {opp.requirement}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <TrustBadge level={opp.status === 'VALIDATED' ? 'CONFIRMED' : 'INFERENCE'} />
                  <span className="metadata text-secondary" style={{ fontSize: '12px' }}>
                    Confidence {opp.confidence}%
                  </span>
                </div>
                <div className="metadata text-secondary" style={{ fontSize: '12px' }}>
                  {new Date(opp.updatedAt).toLocaleDateString()}
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
