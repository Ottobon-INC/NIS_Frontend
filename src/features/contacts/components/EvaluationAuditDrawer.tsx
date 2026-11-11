import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  RefreshCw,
  X,
  CheckCircle2,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';
import {
  evalsApi,
  type EvaluationBadge,
  type EvalRunResponse,
  type EvaluationDimensionDetail
} from '../../../services/api/evals.api';

interface AccuracyBadgePillProps {
  badge?: EvaluationBadge | null;
  onClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
}

export const AccuracyBadgePill: React.FC<AccuracyBadgePillProps> = ({
  badge,
  onClick,
  compact = false
}) => {
  if (!badge) return null;

  const isGreen = badge.color === 'green';
  const isAmber = badge.color === 'amber';

  const colors = isGreen
    ? { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#10B981' }
    : isAmber
      ? { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' }
      : { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444' };

  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to inspect AI accuracy verification breakdown"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: compact ? '3px 8px' : '4px 10px',
        borderRadius: '6px',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        fontSize: compact ? '11px' : '12px',
        fontWeight: 700,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        lineHeight: 1.2
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
          display: 'inline-block',
          flexShrink: 0
        }}
      />
      <span>
        {compact ? `${badge.percentage.toFixed(0)}% AI Verified` : `${badge.label} (${badge.percentage.toFixed(1)}%)`}
      </span>
    </button>
  );
};

interface EvaluationAuditDrawerProps {
  contactId: string;
  contactName: string;
  initialEval?: EvalRunResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationAuditDrawer: React.FC<EvaluationAuditDrawerProps> = ({
  contactId,
  contactName,
  initialEval,
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [isReevaluating, setIsReevaluating] = useState(false);

  const { data: evalData, isLoading, isError } = useQuery({
    queryKey: ['contactEval', contactId],
    queryFn: () => evalsApi.getContactEvaluation(contactId),
    initialData: initialEval || undefined,
    enabled: isOpen && Boolean(contactId),
  });

  if (!isOpen) return null;

  const handleRunLlmJudge = async () => {
    try {
      setIsReevaluating(true);
      const updated = await evalsApi.runContactEvaluation(contactId, true);
      queryClient.setQueryData(['contactEval', contactId], updated);
      await queryClient.invalidateQueries({ queryKey: ['contact360', contactId] });
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      await queryClient.invalidateQueries({ queryKey: ['evalSummary'] });
    } catch (err: any) {
      alert(`Evaluation audit failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsReevaluating(false);
    }
  };

  const score = evalData?.overall_accuracy_score ?? 0;
  const badgeColor = evalData?.badge?.color || (score >= 95 ? 'green' : score >= 80 ? 'amber' : 'red');
  const headerAccent =
    badgeColor === 'green'
      ? { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' }
      : badgeColor === 'amber'
        ? { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' }
        : { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };

  const getStatusChip = (dim: EvaluationDimensionDetail) => {
    if (dim.status === 'PASS') {
      return { bg: '#ECFDF5', color: '#047857', icon: <CheckCircle2 size={13} color="#10B981" /> };
    }
    if (dim.status === 'WARNING') {
      return { bg: '#FFFBEB', color: '#B45309', icon: <AlertTriangle size={13} color="#F59E0B" /> };
    }
    return { bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={13} color="#EF4444" /> };
  };

  const getBarColor = (val: number) => {
    if (val >= 90) return '#10B981';
    if (val >= 75) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#F8FAFC'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={18} color="#2563EB" />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#2563EB' }}>
                AI Accuracy & Verification Audit
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              {contactName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoading && !evalData ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              Auditing evidence sources, citations, and problem grounding...
            </div>
          ) : isError && !evalData ? (
            <div style={{ padding: '20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px' }}>
              Failed to load AI evaluation report for this contact.
            </div>
          ) : evalData ? (
            <>
              {/* Composite Accuracy Hero Card */}
              <div
                style={{
                  background: headerAccent.bg,
                  border: `1px solid ${headerAccent.border}`,
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: headerAccent.text }}>
                    Composite Quality Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: headerAccent.text, lineHeight: 1 }}>
                      {evalData.overall_accuracy_score.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: headerAccent.text }}>
                      · {evalData.badge.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                    Audit Mode: <strong>{evalData.badge.tier}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunLlmJudge}
                  disabled={isReevaluating}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isReevaluating ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
                    flexShrink: 0
                  }}
                >
                  <RefreshCw size={13} className={isReevaluating ? 'animate-spin' : ''} />
                  {isReevaluating ? 'Auditing…' : 'Run LLM Judge'}
                </button>
              </div>

              {/* Claim Counts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{evalData.total_claims_evaluated}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Claims Checked</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #A7F3D0', background: '#ECFDF5', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857' }}>{evalData.verified_claims_count}</div>
                  <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 600, marginTop: '2px' }}>Entailed / Verified</div>
                </div>
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: evalData.hallucinated_claims_count > 0 ? '1px solid #FECACA' : '1px solid #E2E8F0',
                  background: evalData.hallucinated_claims_count > 0 ? '#FEF2F2' : '#F8FAFC',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: evalData.hallucinated_claims_count > 0 ? '#DC2626' : '#0F172A' }}>
                    {evalData.hallucinated_claims_count}
                  </div>
                  <div style={{ fontSize: '11px', color: evalData.hallucinated_claims_count > 0 ? '#991B1B' : '#64748B', fontWeight: 600, marginTop: '2px' }}>
                    Unsupported / Gaps
                  </div>
                </div>
              </div>

              {/* Dimensional Breakdown */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Activity size={15} color="#475569" />
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Pipeline Accuracy Breakdown
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {evalData.dimensions.map((dim) => {
                    const chip = getStatusChip(dim);
                    const barColor = getBarColor(dim.score);

                    return (
                      <div
                        key={dim.dimension_name}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {dim.dimension_name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: barColor }}>
                              {dim.score.toFixed(1)}%
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '9999px',
                                backgroundColor: chip.bg,
                                color: chip.color
                              }}
                            >
                              {chip.icon}
                              {dim.status}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(0, dim.score))}%`,
                              height: '100%',
                              backgroundColor: barColor,
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                          <span>{dim.summary}</span>
                          <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                            Target ≥ {dim.target_threshold}%
                          </span>
                        </div>

                        {dim.issues_detected && dim.issues_detected.length > 0 && (
                          <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '6px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                            {dim.issues_detected.map((issue, idx) => (
                              <div key={idx} style={{ fontSize: '11px', color: '#B91C1C', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                                <span>•</span>
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LLM Judge Reasoning (if available) */}
              {evalData.detailed_findings?.faithfulness?.reasoning && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    <Sparkles size={14} color="#6366F1" />
                    <span>Auditor Assessment Notes</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    {evalData.detailed_findings.faithfulness.reasoning}
                  </p>
                </div>
              )}

              {/* Formula Reference Footer */}
              <div style={{ padding: '12px', borderRadius: '8px', background: '#F1F5F9', fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={14} color="#64748B" style={{ flexShrink: 0 }} />
                <span>
                  Score weights: 25% Identity · 20% Citations · 20% Grounding · 20% Faithfulness · 15% Solution Alignment.
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
