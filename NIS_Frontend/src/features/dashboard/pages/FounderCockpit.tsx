import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { FounderDecisionQueue } from '../../../components/intelligence/FounderDecisionQueue';
import type { DecisionItem } from '../../../components/intelligence/FounderDecisionQueue';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import { useFounderDecisions } from '../../../hooks/useFounderDecisions';

export const FounderCockpit: React.FC = () => {
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  const { data: decisionItems, isLoading, isError } = useFounderDecisions();

  const handleDecisionAction = (item: DecisionItem) => {
    if (item.type === 'VALIDATION_REQUIRED') {
      navigate('/opportunities/123/validate');
    } else if (item.type === 'MATCH_REVIEW_REQUIRED') {
      navigate('/network/matches/match-456');
    }
  };

  return (
    <WorkspaceShell
      title="Founder Intelligence"
      subtitle="What needs your attention today?"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>
        
        {/* Founder Attention Queue */}
        <section>
          <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Founder Attention</h2>
            <span className="body-text text-secondary">{decisionItems?.length || 0} items requiring decision</span>
          </div>
          {isLoading ? (
            <div style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--color-text-secondary)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              Loading founder attention items...
            </div>
          ) : isError ? (
            <div style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--color-error)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              Unable to load founder attention items.
            </div>
          ) : (
            <FounderDecisionQueue items={decisionItems || []} onDecisionAction={handleDecisionAction} />
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }}>
          {/* Important Signals */}
          <section>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Important Signals</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div 
                style={{ padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                onClick={() => openEvidenceDrawer('signal-789', 'SIGNAL', 'Cloud Modernization Strategy')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="body-text-important">Acme Technologies</span>
                  <TrustBadge level="SIGNAL" />
                </div>
                <p className="body-text" style={{ margin: '0 0 var(--space-2) 0' }}>Announced major cloud modernization initiative.</p>
                <span className="labels" style={{ color: 'var(--color-brand-primary)' }}>Related: Rahul Mehta (VP Engineering)</span>
              </div>
            </div>
          </section>

          {/* Active Opportunities */}
          <section>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Active Opportunities</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="body-text-important">Sarah Connor · Cyberdyne</span>
                  <span className="labels" style={{ padding: 'var(--space-1) var(--space-2)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>MATCHING</span>
                </div>
                <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Problem: Legacy Monolith Scaling</p>
                <button 
                  className="button-text"
                  onClick={() => navigate('/opportunities/123/solutions')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', padding: 0, cursor: 'pointer' }}
                >
                  View Solution Candidates →
                </button>
              </div>
            </div>
          </section>
        </div>

      </div>
    </WorkspaceShell>
  );
};
