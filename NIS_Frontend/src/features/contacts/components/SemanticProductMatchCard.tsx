import React, { useState, useEffect } from 'react';
import { matchingApi } from '../../../services/api/matching.api';
import type { SemanticProductMatchResponse } from '../../../services/api/matching.api';

interface SemanticProductMatchCardProps {
  contactId: string;
  contactName?: string;
  contactCompany?: string;
  contactTitle?: string;
  defaultProblem?: string;
}

export const SemanticProductMatchCard: React.FC<SemanticProductMatchCardProps> = ({
  contactId,
  contactName,
  contactCompany,
  contactTitle,
  defaultProblem = ''
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
      } else {
        const res = await matchingApi.semanticMatchConnection(contactId);
        setMatchResult(res);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: '#EEF2FF',
              color: '#4F46E5',
              fontSize: '14px'
            }}>
              ✦
            </span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
              Semantic Product & Solution Matching
            </h3>
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#F1F5F9',
              color: '#475569'
            }}>
              AI Catalog Mapping
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Maps the connection's identified problem to our 5-product portfolio or provides structured advisory intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => {
              const nextMode = !isCustomMode;
              setIsCustomMode(nextMode);
              if (!nextMode) {
                runMatching(undefined, false);
              }
            }}
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              background: isCustomMode ? '#EEF2FF' : '#F8FAFC',
              color: isCustomMode ? '#4F46E5' : '#475569',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {isCustomMode ? 'Use Connection Dossier' : 'Test Custom Problem'}
          </button>
          <button
            type="button"
            onClick={() => runMatching()}
            disabled={isLoading}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              background: 'var(--color-brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Matching...' : 'Re-match'}
          </button>
        </div>
      </div>

      {/* Problem Display / Editor */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
            {isCustomMode ? 'Evaluating Problem Statement:' : 'Identified Problem from Connection:'}
          </span>
          {matchResult?.problem_domain && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#EEF2FF',
              color: '#4F46E5',
              border: '1px solid #E0E7FF'
            }}>
              Domain: {matchResult.problem_domain}
            </span>
          )}
        </div>

        {isCustomMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Enter connection's problem to test semantic product mapping (e.g. 'Expansion and growth in the retail and real estate market, particularly in India')"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '13px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#64748B', alignSelf: 'center' }}>Presets:</span>
              <button
                type="button"
                onClick={() => {
                  const p = "Expansion and growth in the retail and real estate market, particularly in India.";
                  setProblemText(p);
                  runMatching(p);
                }}
                style={{ fontSize: '11px', background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retail Expansion (Insufficient Info)
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = "Our HR team is overwhelmed with manual employee onboarding, delayed leave approvals, and payroll processing errors.";
                  setProblemText(p);
                  runMatching(p);
                }}
                style={{ fontSize: '11px', background: '#fff', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                HR/Payroll Problem (TalentOps)
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = "Specialty clinic doctors wasting clinical hours dealing with unqualified patient inquiries and lack of bilingual patient intake.";
                  setProblemText(p);
                  runMatching(p);
                }}
                style={{ fontSize: '11px', background: '#fff', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Clinic Intake (JanmaSethu)
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = "Founders seeking executive thought leadership on LinkedIn but unconfirmed content production workflow.";
                  setProblemText(p);
                  runMatching(p);
                }}
                style={{ fontSize: '11px', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                Thought Leadership (Needs Validation)
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = "We need heavy hydraulic excavators, bulldozer leasing, and civil engineering earthmoving concrete.";
                  setProblemText(p);
                  runMatching(p);
                }}
                style={{ fontSize: '11px', background: '#fff', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Civil Excavators (No Match)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500, lineHeight: 1.5 }}>
            "{matchResult?.identified_problem || problemText || 'Extracting connection problem from dossier...'}"
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: 'var(--space-3)', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
          Performing capability evaluation across product portfolio...
        </div>
      )}

      {/* MATCH RESULTS DISPLAY */}
      {!isLoading && matchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: theme.bg,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>
                {theme.icon}
              </span>
              <strong style={{
                fontSize: '13px',
                color: theme.text,
                letterSpacing: '0.02em'
              }}>
                {matchResult.suggested_status}
              </strong>
            </div>

            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '2px 8px',
              borderRadius: '4px',
              background: theme.badgeBg,
              color: theme.badgeText
            }}>
              {theme.label}
            </span>
          </div>

          {/* RATIONALE & ASSESSMENT */}
          <div style={{
            padding: 'var(--space-4)',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#334155'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '4px' }}>
              Evaluation Rationale:
            </div>
            {matchResult.rationale}
            {matchResult.capability_gap && (
              <div style={{ marginTop: '8px', padding: '6px 10px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '4px', color: '#991B1B', fontWeight: 600, fontSize: '12px' }}>
                Capability Boundary: {matchResult.capability_gap}
              </div>
            )}
          </div>

          {/* VERIFIED FACTS & RELEVANT EVIDENCE */}
          {matchResult.relevant_evidence && matchResult.relevant_evidence.length > 0 && (
            <div style={{
              padding: 'var(--space-4)',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px' }}>📌</span>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Documented Evidence (Verified Facts):
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {matchResult.relevant_evidence.map((ev, idx) => (
                  <li key={idx} style={{ lineHeight: 1.4 }}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* OUTCOME-SPECIFIC DETAILS */}

          {/* 1. INSUFFICIENT_INFORMATION DISPLAY */}
          {outcome === 'INSUFFICIENT_INFORMATION' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>📋</span>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3730A3' }}>
                  Discovery Requirements Before Capability Matching:
                </span>
              </div>

              {/* Missing Information */}
              {matchResult.missing_information && matchResult.missing_information.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#4338CA', marginBottom: '4px' }}>
                    Information Needed to Evaluate Fit:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#1E1B4B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.missing_information.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Questions */}
              {matchResult.validation_questions && matchResult.validation_questions.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#4338CA', marginBottom: '4px' }}>
                    Suggested Discovery Questions:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#1E1B4B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.validation_questions.map((q, idx) => (
                      <li key={idx}>"{q}"</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unverified Hypotheses */}
              {matchResult.unverified_hypotheses && matchResult.unverified_hypotheses.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', marginBottom: '4px' }}>
                    Operational Hypotheses (Unverified — Do Not Treat As Fact):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#4B5563', fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.unverified_hypotheses.map((hyp, idx) => (
                      <li key={idx}>{hyp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 2. NEEDS_VALIDATION DISPLAY */}
          {outcome === 'NEEDS_VALIDATION' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>⚡</span>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400E' }}>
                  Prerequisites Requiring Founder Validation:
                </span>
              </div>

              {matchResult.unverified_hypotheses && matchResult.unverified_hypotheses.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', marginBottom: '4px' }}>
                    Unverified Assumptions & Prerequisites:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#78350F', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.unverified_hypotheses.map((hyp, idx) => (
                      <li key={idx}>{hyp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {matchResult.validation_questions && matchResult.validation_questions.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', marginBottom: '4px' }}>
                    Questions to Confirm Before Recommendation:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#78350F', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {matchResult.validation_questions.map((q, idx) => (
                      <li key={idx}>"{q}"</li>
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
