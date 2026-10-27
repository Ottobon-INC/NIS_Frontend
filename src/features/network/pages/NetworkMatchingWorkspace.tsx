import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Send
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useOpportunity } from '../../../hooks/useOpportunities';
import { useNetworkMatches, useUpdateNetworkMatchStatus } from '../../../hooks/useNetworkMatching';
import type { NetworkMatch } from '../../../services/api/networkMatching.api';

export const NetworkMatchingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: opp, isLoading: isOppLoading } = useOpportunity(id || '');
  const { data: networkData, isLoading: isMatchesLoading, isError } = useNetworkMatches(id || '');
  const updateMatchMutation = useUpdateNetworkMatchStatus(id || '');

  const [activeTab, setActiveTab] = useState<'ALL' | 'STRONG' | 'MODERATE' | 'POTENTIAL'>('ALL');

  if (!id) return <div>Invalid Opportunity ID</div>;

  const allMatches: NetworkMatch[] = networkData?.matches || [];

  const strongMatches = useMemo(() => 
    allMatches.filter(m => m.dimensions.relationshipStrength === 'STRONG' || m.confidence >= 85),
    [allMatches]
  );
  const moderateMatches = useMemo(() => 
    allMatches.filter(m => m.dimensions.relationshipStrength === 'MODERATE' || (m.confidence >= 70 && m.confidence < 85)),
    [allMatches]
  );
  const potentialMatches = useMemo(() => 
    allMatches.filter(m => m.dimensions.relationshipStrength !== 'STRONG' && m.dimensions.relationshipStrength !== 'MODERATE' && m.confidence < 70),
    [allMatches]
  );

  const displayedMatches = useMemo(() => {
    if (activeTab === 'STRONG') return strongMatches;
    if (activeTab === 'MODERATE') return moderateMatches;
    if (activeTab === 'POTENTIAL') return potentialMatches;
    return allMatches;
  }, [activeTab, allMatches, strongMatches, moderateMatches, potentialMatches]);

  const handleRequestIntro = async (match: NetworkMatch) => {
    try {
      await updateMatchMutation.mutateAsync({ matchId: match.id, status: 'SELECTED' });
      navigate(`/opportunities/${id}/introduction`);
    } catch {
      navigate(`/opportunities/${id}/introduction`);
    }
  };

  const hasSelected = allMatches.some(m => m.status === 'SELECTED');

  return (
    <WorkspaceShell
      title="Network Matching"
      subtitle={opp ? `Business connections from your network for ${opp.companyName}` : 'Business connections from your network'}
      breadcrumbs={[
        { label: 'Opportunities', path: '/opportunities' },
        { label: opp?.title || 'Detail', path: `/opportunities/${id}` },
        { label: 'Network Matching', path: `/opportunities/${id}/network-matching` }
      ]}
      isLoading={isOppLoading || isMatchesLoading}
      isError={isError}
      isEmpty={!isOppLoading && !isMatchesLoading && allMatches.length === 0}
      emptyStateMessage="No sufficiently supported network match found for this opportunity."
      primaryAction={
        hasSelected ? {
          label: 'Proceed to Introduction Workspace →',
          onClick: () => navigate(`/opportunities/${id}/introduction`),
          disabled: false
        } : undefined
      }
    >
      {opp && networkData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Action Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => navigate(`/opportunities/${id}/matching`)}
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
              <span>Back to Capability Matching</span>
            </button>

            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Selected Capability: <strong>{networkData.selectedCapability?.name || 'All Solutions'}</strong>
            </span>
          </div>

          {/* Segmented Tabs (Screen 7 specification) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '0'
          }}>
            {[
              { key: 'ALL', label: 'All Matches', count: allMatches.length },
              { key: 'STRONG', label: 'Strong', count: strongMatches.length },
              { key: 'MODERATE', label: 'Moderate', count: moderateMatches.length },
              { key: 'POTENTIAL', label: 'Potential', count: potentialMatches.length },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563EB' : '#64748B',
                    borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                    marginBottom: '-1px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: isActive ? '#EFF6FF' : '#F1F5F9',
                    color: isActive ? '#1D4ED8' : '#64748B'
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Screen 7 Match Table */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 20px' }}>Contact Name</th>
                    <th style={{ padding: '14px 20px' }}>Title &amp; Company</th>
                    <th style={{ padding: '14px 20px' }}>Reasoning &amp; Mutual Value</th>
                    <th style={{ padding: '14px 20px' }}>Strength</th>
                    <th style={{ padding: '14px 20px' }}>Confidence</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMatches.map((match) => {
                    const isSelected = match.status === 'SELECTED';
                    const isStrong = match.dimensions.relationshipStrength === 'STRONG' || match.confidence >= 85;
                    const isModerate = match.dimensions.relationshipStrength === 'MODERATE' || (match.confidence >= 70 && match.confidence < 85);
                    
                    const initials = match.candidateName
                      ? match.candidateName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'OT';

                    return (
                      <tr
                        key={match.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: isSelected ? '#F0FDF4' : '#FFFFFF',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Contact Name & Avatar */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#EEF2FF',
                              color: '#2563EB',
                              fontWeight: 700,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', display: 'block' }}>
                                {match.candidateName}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                {match.matchType} Match
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Title & Company */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: '#1E293B', fontWeight: 500 }}>
                              {match.candidateTitle}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '12px' }}>
                              <Building2 size={12} />
                              <span>{match.candidateCompany}</span>
                            </div>
                          </div>
                        </td>

                        {/* Reasoning */}
                        <td style={{ padding: '16px 20px', maxWidth: '380px' }}>
                          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', color: '#334155' }}>
                            {match.reasoning}
                          </p>
                        </td>

                        {/* Strength Badge */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: isStrong ? '#ECFDF5' : isModerate ? '#FEF3C7' : '#EFF6FF',
                            color: isStrong ? '#047857' : isModerate ? '#B45309' : '#1D4ED8',
                            border: `1px solid ${isStrong ? '#A7F3D0' : isModerate ? '#FDE68A' : '#DBEAFE'}`
                          }}>
                            {isStrong ? 'Strong' : isModerate ? 'Moderate' : 'Potential'}
                          </span>
                        </td>

                        {/* Confidence */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
                              {match.confidence}%
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleRequestIntro(match)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              background: isSelected ? '#ECFDF5' : '#2563EB',
                              color: isSelected ? '#047857' : '#FFFFFF',
                              border: isSelected ? '1px solid #A7F3D0' : 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: isSelected ? 'none' : '0 1px 2px rgba(37,99,235,0.2)'
                            }}
                          >
                            <Send size={12} />
                            <span>{isSelected ? 'Intro Selected' : 'Request Intro'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
