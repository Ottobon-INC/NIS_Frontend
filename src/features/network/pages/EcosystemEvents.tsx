import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../../../services/api/network.api';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { Network, Zap, Cpu, Search, ArrowRight, User } from 'lucide-react';

export const EcosystemEvents: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ecosystemEvents'],
    queryFn: networkApi.getEvents
  });

  const events = data?.events || [];
  const filteredEvents = events.filter(ev => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return ev.title.toLowerCase().includes(q) ||
           ev.description.toLowerCase().includes(q) ||
           ev.contactName.toLowerCase().includes(q);
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
            fontWeight: 600,
            background: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            border: '1px solid var(--color-brand-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={14} />
          <span>Ecosystem Events ({events.length})</span>
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
            fontWeight: 500,
            background: '#FFFFFF',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Cpu size={14} />
          <span>Cross-Client Intelligence</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
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
            placeholder="Search ecosystem events, triggers, or contacts..."
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

      {/* Event Cards List */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-secondary)' }}>
          Loading network ecosystem events...
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
          Failed to load ecosystem events.
        </div>
      )}

      {!isLoading && !isError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 'var(--space-6)',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {/* Meta Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {ev.date}
                  </span>
                  <TrustBadge level="SIGNAL" />
                  {ev.signalStrength === 'HIGH' && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--badge-amber-bg)',
                      color: 'var(--badge-amber-text)',
                      border: '1px solid #FDE68A'
                    }}>
                      High Priority
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {ev.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  {ev.description}
                </p>

                {/* Trigger Context Contact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span>Trigger Context:</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/people/${ev.contactId}`)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid var(--color-border)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--color-brand-primary)',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <User size={12} />
                    <span>{ev.contactName}</span>
                  </button>
                </div>
              </div>

              {/* Action */}
              <div style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/people/${ev.contactId}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 14px', fontSize: '13px' }}
                >
                  <span>Analyze Context</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              <Zap size={32} style={{ margin: '0 auto 12px auto', color: '#94A3B8' }} />
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>No ecosystem events found</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>No triggers matching your query were detected.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
