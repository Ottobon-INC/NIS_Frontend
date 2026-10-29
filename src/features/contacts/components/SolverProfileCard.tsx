import React from 'react';
import { Zap, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface SolverProfileCardProps {
  domainKnowledge?: string;
  whatTheyCanSolve?: string[];
  coreStrengths?: string[];
}

export const SolverProfileCard: React.FC<SolverProfileCardProps> = ({
  domainKnowledge,
  whatTheyCanSolve = [],
  coreStrengths = [],
}) => {
  const hasData =
    (domainKnowledge && domainKnowledge !== 'Unverified' && domainKnowledge.trim().length > 0) ||
    whatTheyCanSolve.length > 0 ||
    coreStrengths.length > 0;

  if (!hasData) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Zap size={16} color="#7C3AED" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Solver Capabilities &amp; Superpowers
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
          Deep person solver profile will be extracted and synthesized during multi-angle research.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={15} color="#7C3AED" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Solver Capabilities &amp; Superpowers
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              X &rarr; Y Network Solvability &amp; Execution Superpowers
            </span>
          </div>
        </div>
      </div>

      {/* Domain Knowledge Synthesis */}
      {domainKnowledge && domainKnowledge !== 'Unverified' && (
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '12px 14px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
            Domain Knowledge &amp; Systems Understanding
          </div>
          <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.5' }}>
            {domainKnowledge}
          </div>
        </div>
      )}

      {/* Two-Column Grid: What They Can Solve & Core Strengths */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* What They Can Solve */}
        <div
          style={{
            background: '#FAF5FF',
            border: '1px solid #E9D5FF',
            borderRadius: '10px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Zap size={14} color="#7C3AED" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
              What They Can Solve For Others ({whatTheyCanSolve.length})
            </span>
          </div>

          {whatTheyCanSolve.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {whatTheyCanSolve.map((item, idx) => (
                <li key={idx} style={{ fontSize: '13px', color: '#3B0764', lineHeight: '1.4' }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: '#9333EA', fontStyle: 'italic' }}>
              No specific solvable problems cataloged yet.
            </p>
          )}
        </div>

        {/* Core Strengths & Superpowers */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Award size={14} color="#15803D" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Core Strengths &amp; Superpowers ({coreStrengths.length})
            </span>
          </div>

          {coreStrengths.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {coreStrengths.map((str, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#DCFCE7',
                    color: '#14532D',
                    border: '1px solid #86EFAC',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={11} color="#16A34A" />
                  {str}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: '#16A34A', fontStyle: 'italic' }}>
              No explicit superpower tags extracted yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
