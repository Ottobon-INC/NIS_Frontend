import React from 'react';
import { X, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { contactsApi, type EvidenceDetail } from '../../services/api/contacts.api';
import styles from './GlobalEvidenceDrawer.module.css';

export const GlobalEvidenceDrawer: React.FC = () => {
  const { evidenceDrawer, closeEvidenceDrawer } = useUIStore();

  const {
    data: evidence,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EvidenceDetail>({
    queryKey: ['evidence-detail', evidenceDrawer.contactId, evidenceDrawer.evidenceId],
    queryFn: async () => {
      if (!evidenceDrawer.evidenceId) throw new Error('No evidence ID provided');
      return contactsApi.getEvidence(evidenceDrawer.contactId || '', evidenceDrawer.evidenceId);
    },
    enabled: evidenceDrawer.isOpen && !!evidenceDrawer.evidenceId,
    staleTime: 5 * 60 * 1000,
  });

  if (!evidenceDrawer.isOpen) return null;

  const currentType = (evidence?.evidence_type || evidenceDrawer.type || 'FACT').toUpperCase();
  const displayTitle = evidence?.claim || evidenceDrawer.contentTitle || 'Evidence Record';

  return (
    <>
      <div className={styles.overlay} onClick={closeEvidenceDrawer} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Evidence Details</h3>
            <p className={styles.subtitle} title={displayTitle}>
              {displayTitle.length > 55 ? `${displayTitle.substring(0, 52)}...` : displayTitle}
            </p>
          </div>
          <button onClick={closeEvidenceDrawer} className={styles.closeBtn} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <span>Retrieving persisted evidence record...</span>
            </div>
          ) : isError ? (
            <div className={styles.errorBox}>
              <AlertTriangle size={28} color="#DC2626" />
              <h4 className={styles.errorTitle}>Evidence Record Inaccessible</h4>
              <p className={styles.errorMessage}>
                {(error as any)?.message || 'The requested evidence could not be retrieved or belongs to another entity.'}
              </p>
              <button onClick={() => refetch()} className={styles.retryBtn}>
                <RefreshCw size={12} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                Retry Request
              </button>
            </div>
          ) : evidence ? (
            <div>
              {/* Type Badge */}
              <div className={styles.tagGroup} style={{ marginBottom: 'var(--space-4)' }}>
                <span className={`${styles.typeBadge} ${styles[currentType.toLowerCase()] || styles.fact}`}>
                  {currentType}
                </span>
              </div>

              {/* 1. Claim Text */}
              <p className={styles.label}>Claim / Evidence Statement</p>
              <div className={styles.claimBox}>
                "{evidence.claim}"
              </div>

              {/* 2. Claim Extraction Confidence */}
              <p className={styles.label}>Claim Confidence</p>
              <div className={styles.confidenceBox}>
                <div className={styles.confidenceBar}>
                  <div
                    className={styles.confidenceFill}
                    style={{
                      width: `${Math.min(100, Math.max(0, evidence.confidence))}%`,
                      backgroundColor: evidence.confidence >= 80 ? 'var(--color-success)' : evidence.confidence >= 60 ? '#D97706' : '#DC2626'
                    }}
                  />
                </div>
                <span>{evidence.confidence}%</span>
              </div>

              {/* 3. Identity Resolution (Distinct from Claim Confidence) */}
              <p className={styles.label}>Target Identity Match Context</p>
              <div className={styles.identityCard}>
                <div className={styles.identityHeader}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Identity Verification
                  </span>
                  <span className={`${styles.identityStatus} ${
                    evidence.identity_match_status === 'CONFIRMED'
                      ? styles.statusConfirmed
                      : evidence.identity_match_status === 'PROBABLE'
                      ? styles.statusProbable
                      : styles.statusUncertain
                  }`}>
                    {evidence.identity_match_status || 'UNCERTAIN'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Match Confidence:</span>
                  <strong style={{ color: '#1E293B' }}>
                    {evidence.identity_match_confidence != null ? `${evidence.identity_match_confidence}%` : 'Not Assessed'}
                  </strong>
                </div>
                {evidence.identity_match_rationale && (
                  <p className={styles.identityRationale}>
                    {evidence.identity_match_rationale}
                  </p>
                )}
              </div>

              {/* 4. Source Information */}
              <p className={styles.label}>Source & Provenance</p>
              <div className={styles.sourceBox}>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>{evidence.source_name}</span>
                {evidence.source_url && evidence.source_url.startsWith('http') ? (
                  <a
                    href={evidence.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <ExternalLink size={14} /> Open Source
                  </a>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {evidence.source_url || 'Internal Extraction'}
                  </span>
                )}
              </div>

              {/* 5. Supporting Excerpt */}
              <p className={styles.label}>Supporting Source Excerpt</p>
              {evidence.excerpt ? (
                <div className={styles.extractBox}>
                  "{evidence.excerpt}"
                </div>
              ) : (
                <p className={styles.mutedNotice}>
                  No raw excerpt was persisted for this evidence item.
                </p>
              )}

              {/* 6. Dates and Identifiers */}
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Publication Date</span>
                  <span className={styles.metaVal}>
                    {evidence.publication_date
                      ? new Date(evidence.publication_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Unknown / Not specified'}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Retrieved Date</span>
                  <span className={styles.metaVal}>
                    {evidence.retrieved_date
                      ? new Date(evidence.retrieved_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Unavailable'}
                  </span>
                </div>
                <div className={`${styles.metaItem} ${styles.metaItemFull}`}>
                  <span className={styles.metaLabel}>Source Reference</span>
                  <span className={styles.metaVal} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {evidence.source_url || 'None'}
                  </span>
                </div>
              </div>

              {/* Provenance IDs */}
              <div className={styles.provenanceFooter}>
                <span>Evidence ID: {evidence.id}</span>
                <span>Source Result ID: {evidence.source_result_id || 'N/A'}</span>
                <span>Contact ID: {evidence.contact_id}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
              No evidence details selected.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
