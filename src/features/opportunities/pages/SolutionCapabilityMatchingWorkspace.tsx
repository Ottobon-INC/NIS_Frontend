import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity } from '../../../hooks/useOpportunities';
import { useCapabilityMatches, useUpdateMatchStatus } from '../../../hooks/useCapabilityMatching';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';
import type { MatchAlignment, CapabilityMatchStatus } from '../../../services/api/capabilities.api';

const AlignmentIndicator: React.FC<{ label: string; value: MatchAlignment }> = ({ label, value }) => {
  const getColors = () => {
    switch (value) {
      case 'STRONG': return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'MODERATE': return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'WEAK': return { bg: '#FEF2F2', text: '#B91C1C', border: '#FEE2E2' };
      default: return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };
  const colors = getColors();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`
      }}>
        {value}
      </span>
    </div>
  );
};

export const SolutionCapabilityMatchingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  
  const { data: opp, isLoading: isOppLoading } = useOpportunity(id || '');
  const { data: matchesData, isLoading: isMatchesLoading, isError } = useCapabilityMatches(id || '');
  const updateMatchMutation = useUpdateMatchStatus(id || '');

  if (!id) return <div>Invalid Opportunity ID</div>;

  const handleStatusChange = (matchId: string, status: CapabilityMatchStatus) => {
    updateMatchMutation.mutate({ matchId, status });
  };

  const hasSelected = matchesData?.matches.some(m => m.status === 'SELECTED');

  return (
    <WorkspaceShell
      title="Solution & Capability Matching"
      subtitle={opp ? `Match your company's capabilities with ${opp.companyName}'s requirements` : 'Match your company capabilities with this opportunity'}
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` },
        { label: 'Capability Matching', path: `/opportunities/${id}/matching` }
      ]}
      isLoading={isOppLoading || isMatchesLoading}
      isError={isError}
      isEmpty={!isOppLoading && !isMatchesLoading && (!matchesData?.matches || matchesData.matches.length === 0)}
      emptyStateMessage="No sufficiently supported capability match found for this opportunity."
      primaryAction={
        hasSelected ? {
          label: 'Proceed to Network Matching →',
          onClick: () => navigate(`/opportunities/${id}/network-matching`),
          disabled: false
        } : undefined
      }
    >
      {opp && matchesData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Action Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => navigate(`/opportunities/${id}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Opportunity</span>
            </button>

            <span style={{ fontSize: '13px', color: '#64748B' }}>
              <strong>{matchesData.matches.length}</strong> Potential Capability Matches Found
            </span>
          </div>

          {/* AI Callout Banner (Screen 6 specification) */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(37,99,235,0.05)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1E3A8A' }}>
                AI Semantic Capability Alignment
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                Semantic embedding analysis evaluated internal platform features and capability taxonomy against {opp.companyName}&rsquo;s verified problem statements and technical requirements.
              </p>
            </div>
          </div>

          {/* 2-Column Matching View (Screen 6 specification) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
            gap: '24px',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: Matched Capabilities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Matched Capabilities &amp; Solutions
              </h3>

              {matchesData.matches.map(match => {
                const isSelected = match.status === 'SELECTED';
                const confidenceScore = match.confidence || 85;

                return (
                  <div
                    key={match.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      padding: '22px',
                      boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Top Row: Capability Title, Category & Match Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                            {match.capability.name}
                          </h4>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #DBEAFE'
                          }}>
                            {match.capability.category}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                          {match.capability.description}
                        </p>
                      </div>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: confidenceScore >= 90 ? '#ECFDF5' : confidenceScore >= 80 ? '#EFF6FF' : '#FEF3C7',
                        color: confidenceScore >= 90 ? '#047857' : confidenceScore >= 80 ? '#1D4ED8' : '#B45309',
                        border: `1px solid ${confidenceScore >= 90 ? '#A7F3D0' : confidenceScore >= 80 ? '#DBEAFE' : '#FDE68A'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {confidenceScore}% {confidenceScore >= 90 ? 'Strong Match' : 'Match'}
                      </span>
                    </div>

                    {/* Reasoning Box */}
                    <div style={{
                      background: '#F8FAFC',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                        Alignment Rationale
                      </span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: '1.5' }}>
                        {match.reasoning.overallExplanation}
                      </p>
                    </div>

                    {/* Alignment Signals Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px 16px',
                      background: '#FFFFFF',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #F1F5F9'
                    }}>
                      <AlignmentIndicator label="Problem Alignment" value={match.reasoning.problemAlignment} />
                      <AlignmentIndicator label="Requirement Alignment" value={match.reasoning.requirementAlignment} />
                      <AlignmentIndicator label="Technology Alignment" value={match.reasoning.technologyAlignment} />
                      <AlignmentIndicator label="Industry Alignment" value={match.reasoning.industryAlignment} />
                    </div>

                    {/* Bottom Action Row */}
                    <div style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrustBadge level="INFERENCE" />
                        <button
                          onClick={() => openEvidenceDrawer(match.evidenceIds[0], 'INFERENCE', match.capability.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563EB',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          View Supporting Evidence
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isSelected ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#ECFDF5',
                            color: '#047857',
                            border: '1px solid #A7F3D0',
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            <CheckCircle2 size={16} />
                            <span>Capability Selected</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(match.id, 'SELECTED')}
                            disabled={updateMatchMutation.isPending}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(37,99,235,0.2)'
                            }}
                          >
                            Select Match
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: Opportunity Requirements Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}>
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Client Target
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    {opp.companyName}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    {opp.title}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Observed Business Need
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: '1.5' }}>
                    {opp.problem}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Opportunity Requirements
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      opp.requirement,
                      'Enterprise integration compatibility',
                      'Scalable data infrastructure support'
                    ].map((req, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155' }}>
                        <CheckCircle2 size={16} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                  <button
                    onClick={() => navigate(`/opportunities/${id}/network-matching`)}
                    disabled={!hasSelected}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '8px',
                      background: hasSelected ? '#2563EB' : '#E2E8F0',
                      color: hasSelected ? '#FFFFFF' : '#94A3B8',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: hasSelected ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Proceed to Network Matching</span>
                    <ChevronRight size={14} />
                  </button>
                  {!hasSelected && (
                    <span style={{ display: 'block', textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                      Select at least one capability to advance
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
