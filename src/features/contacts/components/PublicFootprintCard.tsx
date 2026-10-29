import React, { useState } from 'react';
import { Briefcase, Layers, Mic, BookOpen, ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface PublicFootprintCardProps {
  careerHistory?: string[];
  notableProjects?: string[];
  summitsAndTalks?: string[];
  publicationsAndArticles?: string[];
}

export const PublicFootprintCard: React.FC<PublicFootprintCardProps> = ({
  careerHistory = [],
  notableProjects = [],
  summitsAndTalks = [],
  publicationsAndArticles = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalItems =
    careerHistory.length +
    notableProjects.length +
    summitsAndTalks.length +
    publicationsAndArticles.length;

  if (totalItems === 0) {
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
          <Globe size={16} color="#0284C7" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Public Footprint &amp; Career Track Record
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
          No public footprint records (prior roles, builds, summits, or articles) observed in public search evidence.
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
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Globe size={15} color="#0284C7" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Public Footprint &amp; Career Track Record
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Multi-Angle Verifiable Footprint ({totalItems} verified signals)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* 1. Career History */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Briefcase size={13} color="#475569" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase' }}>
                Career History ({careerHistory.length})
              </span>
            </div>
            {careerHistory.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {careerHistory.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No prior roles evidenced
              </span>
            )}
          </div>

          {/* 2. Notable Projects & Builds */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Layers size={13} color="#0284C7" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
                Systems &amp; Builds ({notableProjects.length})
              </span>
            </div>
            {notableProjects.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notableProjects.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: '#0C4A6E', lineHeight: '1.4' }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No technical builds recorded
              </span>
            )}
          </div>

          {/* 3. Summits, Talks & Podcasts */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Mic size={13} color="#D97706" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
                Summits &amp; Talks ({summitsAndTalks.length})
              </span>
            </div>
            {summitsAndTalks.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {summitsAndTalks.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.4' }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No talks or podcasts found
              </span>
            )}
          </div>

          {/* 4. Publications & Articles */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <BookOpen size={13} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                Publications &amp; Posts ({publicationsAndArticles.length})
              </span>
            </div>
            {publicationsAndArticles.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {publicationsAndArticles.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: '#064E3B', lineHeight: '1.4' }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No articles or papers cataloged
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
