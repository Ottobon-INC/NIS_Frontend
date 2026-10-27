import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Building2, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useMeeting } from '../../../hooks/useMeeting';

export const MeetingBriefWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: brief, isLoading, isError } = useMeeting(id || '');

  const [activeTab, setActiveTab] = useState<'briefing' | 'company' | 'context' | 'topics'>('briefing');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <WorkspaceShell
      title={brief?.company ? `${brief.company} - Executive Briefing` : "Meeting Brief"}
      subtitle={brief ? `Preparation for meeting with ${brief.contactName} · ${brief.company}` : 'AI-powered briefing and context before executive meetings'}
      breadcrumbs={[
        { label: 'Meetings', path: '/meetings' },
        { label: brief?.contactName || 'Brief', path: `/meetings/${id}/brief` }
      ]}
      headerActions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
          </button>
        </div>
      }
      primaryAction={{
        label: 'Launch Notes Capture →',
        onClick: () => navigate(`/meetings/${id}/capture`)
      }}
      isLoading={isLoading}
      isError={isError}
      isEmpty={false}
    >
      {brief && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Back Button & Timestamp Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => navigate('/meetings')}
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
              <span>Back to Meetings</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#64748B',
                background: '#F1F5F9',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                <Clock size={12} />
                <span>Today · 2:00 PM EST</span>
              </span>

              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #DBEAFE'
              }}>
                Briefing Ready
              </span>
            </div>
          </div>

          {/* Segmented Tabs (Screen 11 specification) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '0'
          }}>
            {[
              { key: 'briefing', label: 'Briefing' },
              { key: 'company', label: 'Company Intelligence' },
              { key: 'context', label: 'Relevant Context' },
              { key: 'topics', label: 'Suggested Topics' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
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
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2-Column Panels Grid (Screen 11 specification) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 340px) minmax(0, 1fr)',
            gap: '24px',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: Meeting Details & Participants */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Meeting Participants Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Participants
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    color: '#2563EB',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {brief.contactName ? brief.contactName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EX'}
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', display: 'block' }}>
                      {brief.contactName}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Key Executive · {brief.company}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Target Organization
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                    <Building2 size={14} color="#64748B" />
                    <span>{brief.company}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <button
                    onClick={() => navigate(`/people/${brief.contactId}`)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Contact 360 Profile →
                  </button>
                </div>
              </div>

              {/* Relationship Context Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Relationship Context
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                  {brief.relationshipContext}
                </p>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <button
                    onClick={() => navigate(`/people/${brief.contactId}/context`)}
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
                    Inspect Full Trusted Context &rarr;
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: AI Generated Brief & Strategic Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Meeting Objectives Panel */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563EB" />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Meeting Objectives
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {brief.objectives.map((obj, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#1E293B', lineHeight: '1.5' }}>
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>•</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Generated Discussion Topics */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={16} color="#D97706" />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Suggested Discussion Topics
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {brief.suggestedTopics.map((topic, i) => (
                    <div key={i} style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      color: '#334155',
                      lineHeight: '1.4'
                    }}>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Recent Signals */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#2563EB" />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Verified Strategic Signals
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {brief.recentSignals.map((signal, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#1E293B', lineHeight: '1.5' }}>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
