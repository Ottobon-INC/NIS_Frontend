import React from 'react';
import { TrustBadge } from './TrustBadge';

export type DecisionType = 'VALIDATION_REQUIRED' | 'MATCH_REVIEW_REQUIRED' | 'INTRODUCTION_REVIEW_REQUIRED' | 'OUTCOME_REVIEW_REQUIRED';

export interface DecisionItem {
  id: string;
  type: DecisionType;
  title: string;
  description: string;
  personId?: string;
  companyId?: string;
  opportunityId?: string;
  personName: string;
  companyName: string;
  relatedEntityName?: string;
  whyItMatters: string;
  evidenceSummary: string;
  confidence: number;
  status: string;
  primaryActionLabel: string;
}

interface FounderDecisionQueueProps {
  items: DecisionItem[];
  onDecisionAction: (item: DecisionItem) => void;
}

export const FounderDecisionQueue: React.FC<FounderDecisionQueueProps> = ({ items, onDecisionAction }) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: 'var(--space-9)', textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>You are currently up to date. No founder attention items pending.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {items.map(item => (
        <div key={item.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-primary)' }}>
            <span className="labels text-secondary" style={{ letterSpacing: '0.5px' }}>
              {item.title}
            </span>
            <TrustBadge level="INFERENCE" />
          </div>
          
          <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-xl)' }}>{item.personName} · {item.companyName}</h3>
                <div className="body-text-important" style={{ color: 'var(--color-brand-primary)' }}>
                  Related to: {item.relatedEntityName}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <div>
                <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>WHAT WAS DETECTED</span>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{item.description}</p>
              </div>
              <div>
                <span className="labels text-secondary" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>WHY IT MATTERS</span>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{item.whyItMatters}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-primary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-6)' }}>
              <div>
                <span className="body-text-important">Evidence: </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{item.evidenceSummary}</span>
              </div>
              <div>
                <span className="body-text-important">Confidence: </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>{item.confidence}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
              <button className="button-text" style={{ padding: 'var(--space-3) var(--space-6)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                Dismiss
              </button>
              <button 
                className="button-text"
                onClick={() => onDecisionAction(item)}
                style={{ padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                {item.primaryActionLabel}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
