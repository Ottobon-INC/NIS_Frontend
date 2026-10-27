import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  X,
  ExternalLink,
  Search,
  Activity,
  Info,
  Server
} from 'lucide-react';
import type { IdentityAuditData } from '../../../services/api/contacts.api';
import { contactsApi } from '../../../services/api/contacts.api';
import { useQueryClient } from '@tanstack/react-query';

interface IdentityAuditModalProps {
  contactId: string;
  contactName: string;
  auditData?: IdentityAuditData;
  isOpen: boolean;
  onClose: () => void;
}

export const IdentityAuditModal: React.FC<IdentityAuditModalProps> = ({
  contactId,
  contactName,
  auditData,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'diagnostics'>('breakdown');
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const score = auditData?.score ?? 0;
  const isConfirmed = score >= 80;
  const isProbable = score >= 60 && score < 80;
  const isAmbiguous = score < 60;

  const scoreColor = isConfirmed ? '#059669' : isProbable ? '#2563EB' : '#D97706';
  const scoreBg = isConfirmed ? '#ECFDF5' : isProbable ? '#EFF6FF' : '#FFFBEB';
  const scoreBorder = isConfirmed ? '#A7F3D0' : isProbable ? '#BFDBFE' : '#FDE68A';

  const handleRerunResearch = async () => {
    try {
      setIsRetrying(true);
      await contactsApi.triggerResearch(contactId);
      await queryClient.invalidateQueries({ queryKey: ['contact360', contactId] });
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      alert('Deep research job launched across all providers. Background tasks are running.');
    } catch (err: any) {
      alert(`Failed to trigger research: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCopyDiagnostics = () => {
    navigator.clipboard.writeText(JSON.stringify(auditData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedTasks = auditData?.providerDiagnostics.filter(t => t.status === 'COMPLETED') || [];
  const failedTasks = auditData?.providerDiagnostics.filter(t => t.status !== 'COMPLETED') || [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #F8FAFC, #FFFFFF)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: scoreBg,
                border: `1px solid ${scoreBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} color={scoreColor} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  Identity Confidence &amp; Research Diagnostics
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: scoreBg,
                    color: scoreColor,
                    border: `1px solid ${scoreBorder}`
                  }}
                >
                  Score: {score}/100 · {auditData?.status || 'PROBABLE'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748B' }}>
                Audited entity resolution &amp; multi-source execution logs for <strong>{contactName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 24px'
          }}
        >
          <button
            onClick={() => setActiveTab('breakdown')}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'breakdown' ? `2px solid ${scoreColor}` : '2px solid transparent',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'breakdown' ? 700 : 500,
              color: activeTab === 'breakdown' ? '#0F172A' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={15} />
            Confidence Breakdown ({auditData?.factors.length || 4} Criteria)
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'diagnostics' ? `2px solid ${scoreColor}` : '2px solid transparent',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'diagnostics' ? 700 : 500,
              color: activeTab === 'diagnostics' ? '#0F172A' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Activity size={15} />
            Provider Diagnostics &amp; Task Logs ({auditData?.providerDiagnostics.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'breakdown' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score Bar Banner */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: scoreBg,
                  border: `1px solid ${scoreBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Identity Verification Gate: {auditData?.isGatePassed ? 'PASSED (COMMERCIAL PROPOSALS ENABLED)' : 'PENDING VERIFICATION'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                    {auditData?.gateReason
                      ? auditData.gateReason
                      : 'All authoritative identity anchors confirmed. Deterministic disambiguation prevents identity collision.'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                    {score}
                    <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748B' }}>/100</span>
                  </div>
                </div>
              </div>

              {/* Factors Grid */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  Audited Scoring Criteria
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {auditData?.factors.map((factor, idx) => {
                    const isFactorPass = factor.earned === factor.weight;
                    const isFactorPartial = factor.earned > 0 && factor.earned < factor.weight;
                    const factorColor = isFactorPass ? '#059669' : isFactorPartial ? '#2563EB' : '#D97706';
                    const factorBg = isFactorPass ? '#ECFDF5' : isFactorPartial ? '#EFF6FF' : '#FFFBEB';
                    const factorBorder = isFactorPass ? '#A7F3D0' : isFactorPartial ? '#BFDBFE' : '#FDE68A';

                    return (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                              {factor.name}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: factorBg,
                                color: factorColor,
                                border: `1px solid ${factorBorder}`
                              }}
                            >
                              {factor.status}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                            {factor.description}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: factorColor }}>
                            +{factor.earned}
                          </span>
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}> / {factor.weight} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Notes Footer */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#64748B'
                }}
              >
                <div style={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
                  Audited Disambiguation Principle:
                </div>
                Deterministic Entity Resolution Engine: Every point is grounded in verified cryptographic or exact string anchors. Statistical probability heuristics and synthetic guesses are strictly avoided to prevent identity collision.
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    Total Tasks Executed
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                    {auditData?.providerDiagnostics.length || 0}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #A7F3D0', backgroundColor: '#ECFDF5' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#047857', textTransform: 'uppercase' }}>
                    Successful Providers
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#047857', marginTop: '2px' }}>
                    {completedTasks.length}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${failedTasks.length > 0 ? '#FECACA' : '#E2E8F0'}`, backgroundColor: failedTasks.length > 0 ? '#FEF2F2' : '#F8FAFC' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: failedTasks.length > 0 ? '#B91C1C' : '#64748B', textTransform: 'uppercase' }}>
                    Blocked / Failed Providers
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: failedTasks.length > 0 ? '#B91C1C' : '#0F172A', marginTop: '2px' }}>
                    {failedTasks.length}
                  </div>
                </div>
              </div>

              {/* Task Diagnostic List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: '8px 0 4px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Live Provider Execution &amp; Trace Logs
                </h4>
                {auditData?.providerDiagnostics && auditData.providerDiagnostics.length > 0 ? (
                  auditData.providerDiagnostics.map((task, idx) => {
                    const isSuccess = task.status === 'COMPLETED';
                    const isFailed = task.status === 'FAILED';
                    const isBotBlocked = task.errorMessage && (task.errorMessage.includes('999') || task.errorMessage.includes('Bot Challenge'));

                    return (
                      <div
                        key={idx}
                        style={{
                          border: `1px solid ${isBotBlocked ? '#FED7AA' : isFailed ? '#FECACA' : '#E2E8F0'}`,
                          backgroundColor: isBotBlocked ? '#FFFBF5' : isFailed ? '#FEF2F2' : '#FFFFFF',
                          borderRadius: '8px',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>
                              {task.sourceId}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: isSuccess ? '#ECFDF5' : isBotBlocked ? '#FFF7ED' : '#FEF2F2',
                                color: isSuccess ? '#047857' : isBotBlocked ? '#C2410C' : '#B91C1C',
                                border: `1px solid ${isSuccess ? '#A7F3D0' : isBotBlocked ? '#FFEDD5' : '#FECACA'}`
                              }}
                            >
                              {task.status}
                            </span>
                          </div>
                          {task.completedAt && (
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                              {new Date(task.completedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        {task.query && task.query !== 'N/A' && (
                          <div
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              backgroundColor: '#F1F5F9',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#334155',
                              marginBottom: '6px',
                              overflowX: 'auto',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Query: {task.query}
                          </div>
                        )}

                        {task.errorMessage && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: isBotBlocked ? '#9A3412' : '#991B1B',
                              lineHeight: '1.4'
                            }}
                          >
                            <strong>Diagnostic:</strong> {task.errorMessage}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No provider tasks recorded yet. Click &quot;Re-Run Deep Research&quot; below to launch task workers.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyDiagnostics}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              {copied ? 'Copied Diagnostic JSON!' : 'Copy Diagnostics'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRerunResearch}
              disabled={isRetrying}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                opacity: isRetrying ? 0.7 : 1
              }}
            >
              <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
              {isRetrying ? 'Launching Research...' : 'Re-Run Deep Research'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
