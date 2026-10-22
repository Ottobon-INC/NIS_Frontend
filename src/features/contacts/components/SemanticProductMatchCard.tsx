import React, { useState, useEffect } from 'react';
import { matchingApi } from '../../../services/api/matching.api';
import type { SemanticProductMatchResponse } from '../../../services/api/matching.api';

interface SemanticProductMatchCardProps {
  contactId: string;
  contactName?: string;
  contactCompany?: string;
  contactTitle?: string;
  defaultProblem?: string;
  onMatchResult?: (res: SemanticProductMatchResponse | null) => void;
}

export const SemanticProductMatchCard: React.FC<SemanticProductMatchCardProps> = ({
  contactId,
  contactName,
  contactCompany,
  contactTitle,
  defaultProblem = '',
  onMatchResult
}) => {
  const [problemText, setProblemText] = useState(defaultProblem);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<SemanticProductMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update local problem when defaultProblem changes
  useEffect(() => {
    if (defaultProblem && !isCustomMode && !problemText && !matchResult) {
      setProblemText(defaultProblem);
    }
  }, [defaultProblem, isCustomMode, matchResult]);

  const runMatching = async (textToMatch?: string, overrideCustomMode?: boolean) => {
    const customModeActive = overrideCustomMode !== undefined ? overrideCustomMode : isCustomMode;
    const text = textToMatch !== undefined ? textToMatch : problemText;
    setIsLoading(true);
    setError(null);
    try {
      if (text && text.trim() && customModeActive) {
        const res = await matchingApi.semanticMatchProblem(text.trim(), {
          connection_id: contactId,
          connection_name: contactName,
          connection_company: contactCompany,
          connection_title: contactTitle
        });
        setMatchResult(res);
        onMatchResult?.(res);
      } else {
        const res = await matchingApi.semanticMatchConnection(contactId);
        setMatchResult(res);
        onMatchResult?.(res);
        if (res.identified_problem) {
          setProblemText(res.identified_problem);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete semantic product matching.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (contactId) {
      runMatching();
    }
  }, [contactId]);

  const outcome = matchResult?.matching_outcome || 'NO_MATCH_FOUND';

  // Visual style tokens based on outcome
  const getOutcomeTheme = () => {
    switch (outcome) {
      case 'MATCH_FOUND':
        return {
          bg: '#F0FDF4',
          border: '#86EFAC',
          text: '#15803D',
          badgeBg: '#DCFCE7',
          badgeText: '#166534',
          icon: '✓',
          label: 'MATCH FOUND'
        };
      case 'INSUFFICIENT_INFORMATION':
        return {
          bg: '#EEF2FF',
          border: '#C7D2FE',
          text: '#4338CA',
          badgeBg: '#E0E7FF',
          badgeText: '#3730A3',
          icon: 'ℹ',
          label: 'INSUFFICIENT INFORMATION'
        };
      case 'NEEDS_VALIDATION':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          badgeBg: '#FEF3C7',
          badgeText: '#92400E',
          icon: '⚡',
          label: 'NEEDS VALIDATION'
        };
      case 'NO_MATCH_FOUND':
      default:
        return {
          bg: '#F8FAFC',
          border: '#CBD5E1',
          text: '#475569',
          badgeBg: '#F1F5F9',
          badgeText: '#334155',
          icon: '✕',
          label: 'NO PRODUCT FIT'
        };
    }
  };

  const theme = getOutcomeTheme();

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              Observed Problem & Internal Product Fit
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#F1F5F9',
              color: '#475569',
              letterSpacing: '0.04em'
            }}>
              INTERNAL PRODUCTS ONLY
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Evaluates the problem observed in the profile dossier against our internal products.
          </p>
        </div>

        {/* Status Badge */}
        {matchResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            background: theme.badgeBg,
            border: `1px solid ${theme.border}`,
            color: theme.badgeText,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.02em'
          }}>
            <span>{theme.icon}</span>
            <span>{matchResult.suggested_status || theme.label}</span>
          </div>
        )}
      </div>

      {/* Problem Input / Custom Query Box */}
      <div style={{
        padding: 'var(--space-4)',
        background: '#F8FAFC',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Connection Problem Statement
          </span>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4F46E5',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isCustomMode ? '← Use Dossier Identified Problem' : '✏ Edit / Test Custom Problem'}
          </button>
        </div>

        {isCustomMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Enter specific operational problem or business bottleneck..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => runMatching(problemText, true)}
                disabled={isLoading || !problemText.trim()}
                style={{
                  padding: '6px 14px',
                  background: '#4F46E5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Evaluating...' : 'Re-evaluate Capability Fit'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            fontSize: '13px',
            color: '#1E293B',
            lineHeight: 1.5,
            fontStyle: problemText ? 'normal' : 'italic'
          }}>
            &ldquo;{problemText || 'Analyzing dossier to extract smallest solvable problem...'}&rdquo;
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '13px',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-sm)'
        }}>
          Evaluating problem against internal product capabilities...
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-sm)',
          color: '#991B1B',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {/* Match Result Body */}
      {matchResult && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Domain Classification Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#F1F5F9',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: '#334155'
          }}>
            <div>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Identified Business Domain: </span>
              <strong style={{ color: '#0F172A' }}>{matchResult.problem_domain}</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Catalog Bounds: 5 Authentic Internal Products
            </span>
          </div>

          {/* Rationale Callout */}
          <div style={{
            padding: 'var(--space-4)',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            color: theme.text,
            lineHeight: 1.5
          }}>
            <strong>Evaluation Summary: </strong>
            {matchResult.rationale}
          </div>

          {/* 1. NO MATCH FOUND: Show explicit capability gap */}
          {outcome === 'NO_MATCH_FOUND' && matchResult.capability_gap && (
            <div style={{
              padding: 'var(--space-4)',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: '#475569'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '4px' }}>
                Catalog Boundary Gap:
              </div>
              <div>{matchResult.capability_gap}</div>
            </div>
          )}

          {/* 2. INSUFFICIENT_INFORMATION or NEEDS_VALIDATION: Missing Info & Validation Questions */}
          {(outcome === 'INSUFFICIENT_INFORMATION' || outcome === 'NEEDS_VALIDATION') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {/* Missing Details */}
              {matchResult.missing_information && matchResult.missing_information.length > 0 && (
                <div style={{
                  padding: 'var(--space-4)',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '6px' }}>
                    Missing Operational Information:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.missing_information.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Questions */}
              {matchResult.validation_questions && matchResult.validation_questions.length > 0 && (
                <div style={{
                  padding: 'var(--space-4)',
                  background: '#FFFBEB',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #FDE68A'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400E', marginBottom: '6px' }}>
                    Questions to Confirm Before Recommendation:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#78350F', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.validation_questions.map((q, idx) => (
                      <li key={idx}>&ldquo;{q}&rdquo;</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 3. MATCH_FOUND / MATCHED PRODUCTS DISPLAY */}
          {matchResult.matches && matchResult.matches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {matchResult.matches.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-5)',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Product Title Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                          {item.product_name}
                        </h4>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#EEF2FF',
                          color: '#4F46E5'
                        }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                        {item.tagline}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#DCFCE7',
                        color: '#15803D'
                      }}>
                        {item.match_score}% Match
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#334155'
                      }}>
                        {item.alignment_level} FIT
                      </span>
                    </div>
                  </div>

                  {/* Why this product solves it */}
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid #10B981',
                    fontSize: '13px',
                    color: '#1E293B',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: '#0F766E' }}>Why it solves the problem: </strong>
                    {item.why_this_product_solves_it}
                  </div>

                  {/* Relevant features */}
                  {item.relevant_features && item.relevant_features.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '6px' }}>
                        Mapped Product Capabilities:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.relevant_features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              fontSize: '12px',
                              background: '#F1F5F9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assumptions / Prerequisites if any */}
                  {item.assumptions_or_prerequisites && item.assumptions_or_prerequisites.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      <strong style={{ color: '#475569' }}>Prerequisites: </strong>
                      {item.assumptions_or_prerequisites.join(' ')}
                    </div>
                  )}

                  {/* Target Audience & Suggested Step */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {item.target_audience_fit}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5' }}>
                      Next: {item.suggested_first_step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RECOMMENDED NEXT STEP */}
          {matchResult.recommended_next_step && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-sm)'
            }}>
              <span style={{ fontSize: '14px', color: '#4F46E5' }}>➔</span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: '2px' }}>
                  Recommended Action:
                </span>
                <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500 }}>
                  {matchResult.recommended_next_step}
                </span>
              </div>
            </div>
          )}

          {/* HUMAN-IN-THE-LOOP & FOUNDER APPROVAL CONTROLS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: '#64748B'
          }}>
            <span style={{ fontSize: '14px' }}>🛡</span>
            <span>
              <strong>Founder Control Active:</strong> All capability evaluations and next steps remain strictly advisory pending founder review. Autonomous outreach or commercial commitments are disabled.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
