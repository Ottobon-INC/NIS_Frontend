import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../../../services/api/network.api';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { Network, Zap, Cpu, Search, Share2 } from 'lucide-react';

export const CrossClientIntel: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['crossClientInsights'],
    queryFn: networkApi.getInsights
  });

  const insights = data?.insights || [];
  const filteredInsights = insights.filter(item => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(q) ||
           item.description.toLowerCase().includes(q) ||
           item.patternStrength.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Screen 12 Header */}
      <div>
        <h1 className="page-title">Network Map</h1>
        <p className="page-subtitle">Visualize your professional network, ecosystem events, and cross-client intelligence</p>
      </div>

      {/* Screen 12 View Toggle Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '12px'
      }}>
        <button
          type="button"
          onClick={() => navigate('/network')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 500,
            background: '#FFFFFF',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Network size={14} />
          <span>Network View</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/network/events')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 500,
            background: '#FFFFFF',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={14} />
          <span>Ecosystem Events</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/network/cross-client')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            border: '1px solid var(--color-brand-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Cpu size={14} />
          <span>Cross-Client Intelligence ({insights.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: '#FFFFFF',
        padding: 'var(--space-4) var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: '#F8FAFC',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          width: '100%',
          maxWidth: '380px'
        }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search intelligence patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '13px',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-secondary)' }}>
          Loading intelligence aggregations...
        </div>
      )}

      {isError && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--badge-red-bg)',
          color: 'var(--badge-red-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px'
        }}>
          Intelligence aggregation engine currently unavailable.
        </div>
      )}

      {!isLoading && !isError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredInsights.map(insight => (
            <div
              key={insight.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {insight.title}
                  </h3>
                  <TrustBadge level={insight.isConfirmed ? 'CONFIRMED' : 'INFERENCE'} />
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE'
                }}>
                  {insight.patternStrength} Pattern
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                {insight.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155'
              }}>
                <Share2 size={13} color="#2563EB" />
                <span>Found in {insight.relatedNodesCount} active context graphs across ecosystem</span>
              </div>
            </div>
          ))}

          {filteredInsights.length === 0 && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              <Cpu size={32} style={{ margin: '0 auto 12px auto', color: '#94A3B8' }} />
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>No intelligence patterns found</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>No patterns matching your query were detected.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
