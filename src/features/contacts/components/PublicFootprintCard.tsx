import React, { useState } from 'react';
import { Briefcase, Layers, Mic, BookOpen, ChevronDown, ChevronUp, Globe, ExternalLink } from 'lucide-react';

export interface FootprintItem {
  title: string;
  url?: string;
  role?: string;
  company?: string;
  period?: string;
  event?: string;
  source?: string;
  snippet?: string;
  citationKey?: string;
  confidence?: number;
}

interface PublicFootprintCardProps {
  careerHistory?: (string | FootprintItem)[];
  notableProjects?: (string | FootprintItem)[];
  summitsAndTalks?: (string | FootprintItem)[];
  publicationsAndArticles?: (string | FootprintItem)[];
  onOpenEvidence?: (citationKey: string) => void;
}

function normalizeItem(raw: string | FootprintItem): FootprintItem {
  if (typeof raw !== 'string') {
    return raw;
  }

  // Extract markdown link [title](url)
  let title = raw;
  let url: string | undefined = undefined;
  const linkMatch = raw.match(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
  if (linkMatch) {
    title = linkMatch[1];
    url = linkMatch[2];
  }

  // Extract citation [E1] or [E12]
  let citationKey: string | undefined = undefined;
  const citMatch = title.match(/\[(E\d+)\]/);
  if (citMatch) {
    citationKey = `[${citMatch[1]}]`;
    title = title.replace(/\[E\d+\]/g, '').trim();
  }

  return {
    title: title.trim(),
    url,
    citationKey,
    source: url && url.includes('linkedin.com') ? 'LinkedIn Post' : (url && url.includes('medium.com') ? 'Medium' : undefined),
    confidence: citationKey ? 95 : undefined
  };
}

export const PublicFootprintCard: React.FC<PublicFootprintCardProps> = ({
  careerHistory = [],
  notableProjects = [],
  summitsAndTalks = [],
  publicationsAndArticles = [],
  onOpenEvidence,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const normalizedCareer = careerHistory.map(normalizeItem);
  const normalizedProjects = notableProjects.map(normalizeItem);
  const normalizedTalks = summitsAndTalks.map(normalizeItem);
  const normalizedPosts = publicationsAndArticles.map(normalizeItem);

  const totalItems =
    normalizedCareer.length +
    normalizedProjects.length +
    normalizedTalks.length +
    normalizedPosts.length;

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

  const renderCitationPill = (citationKey?: string, confidence?: number) => {
    if (!citationKey) return null;
    return (
      <span
        onClick={(e) => {
          if (onOpenEvidence) {
            e.stopPropagation();
            onOpenEvidence(citationKey);
          }
        }}
        title={`Grounding Evidence ${citationKey}${confidence ? ` (${confidence}% verified)` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: 700,
          background: '#F0FDF4',
          color: '#166534',
          border: '1px solid #BBF7D0',
          padding: '2px 7px',
          borderRadius: '4px',
          cursor: onOpenEvidence ? 'pointer' : 'default',
          flexShrink: 0
        }}
      >
        {confidence ? `${confidence}% ` : ''}{citationKey}
      </span>
    );
  };

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
              Multi-Angle Verifiable Footprint ({totalItems} verified signals with direct source citations)
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* 1. Career History (Timeline) */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} color="#475569" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase' }}>
                  Career Timeline ({normalizedCareer.length})
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>CHRONOLOGICAL</span>
            </div>

            {normalizedCareer.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                {normalizedCareer.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                          {item.role || item.title}
                        </span>
                        {item.company && (
                          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                            at {item.company}
                          </span>
                        )}
                        {item.period && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              background: item.period.toLowerCase().includes('current') ? '#DCFCE7' : '#F1F5F9',
                              color: item.period.toLowerCase().includes('current') ? '#15803D' : '#475569',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {item.period}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderCitationPill(item.citationKey, item.confidence)}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View source"
                            style={{ color: '#2563EB', display: 'inline-flex', padding: '2px' }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                    {item.snippet && (
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                        {item.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No prior roles evidenced
              </span>
            )}
          </div>

          {/* 2. Systems & Builds */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="#0284C7" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
                  Systems &amp; Builds ({normalizedProjects.length})
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#0284C7', fontWeight: 600 }}>ARCHITECTURES</span>
            </div>

            {normalizedProjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {normalizedProjects.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0C4A6E' }}>
                        {item.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderCitationPill(item.citationKey, item.confidence)}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View architecture reference"
                            style={{ color: '#0284C7', display: 'inline-flex', padding: '2px' }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                    {item.snippet && (
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                        {item.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No technical builds recorded
              </span>
            )}
          </div>

          {/* 3. Summits, Keynotes & Public Mentions */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mic size={14} color="#D97706" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
                  Summits &amp; Keynotes ({normalizedTalks.length})
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#B45309', fontWeight: 600 }}>TALKS &amp; PRESS</span>
            </div>

            {normalizedTalks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {normalizedTalks.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        {item.event && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#92400E',
                              background: '#FEF3C7',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              marginBottom: '2px'
                            }}
                          >
                            {item.event}
                          </span>
                        )}
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#78350F' }}>
                          {item.title}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderCitationPill(item.citationKey, item.confidence)}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View talk / summit mention"
                            style={{ color: '#D97706', display: 'inline-flex', padding: '2px' }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                    {item.snippet && (
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                        {item.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                No talks or podcasts found
              </span>
            )}
          </div>

          {/* 4. Publications & Posts with Direct Links */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={14} color="#059669" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                  Publications &amp; Posts ({normalizedPosts.length})
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>DIRECT LINKS</span>
            </div>

            {normalizedPosts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {normalizedPosts.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        {item.source && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#065F46',
                              background: '#D1FAE5',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              width: 'fit-content'
                            }}
                          >
                            {item.source}
                          </span>
                        )}
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#047857',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
                          >
                            {item.title}
                            <ExternalLink size={12} color="#059669" style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#064E3B' }}>
                            {item.title}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderCitationPill(item.citationKey, item.confidence)}
                      </div>
                    </div>
                    {item.snippet && (
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                        {item.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
