import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';

interface MeetingRow {
  id: string;
  name: string;
  participants: string;
  dateTime: string;
  purpose: string;
  status: 'Upcoming' | 'Completed' | 'Scheduled';
}

export const MeetingsWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');

  const meetings: MeetingRow[] = [
    {
      id: 'meet-1',
      name: 'TechCorp - Partnership Discussion',
      participants: 'Alex Chen, Priya Sharma',
      dateTime: 'Jan 20, 2025 · 2:00 PM EST',
      purpose: 'Explore strategic AI platform partnership and integration',
      status: 'Upcoming'
    },
    {
      id: 'meet-2',
      name: 'Horizon VC - Intro Call',
      participants: 'Priya Sharma',
      dateTime: 'Jan 18, 2025 · 11:00 AM EST',
      purpose: 'Discuss investment strategy and enterprise portfolio intro',
      status: 'Completed'
    },
    {
      id: 'meet-3',
      name: 'MediTech - Product Briefing',
      participants: 'David Kim',
      dateTime: 'Jan 15, 2025 · 3:30 PM EST',
      purpose: 'Healthcare AI capability overview and data pipeline compliance',
      status: 'Completed'
    },
    {
      id: 'meet-4',
      name: 'BuildCorp - Commercial Review',
      participants: 'Michael Torres',
      dateTime: 'Jan 22, 2025 · 10:00 AM EST',
      purpose: 'Product distribution and enterprise rollout review',
      status: 'Upcoming'
    },
    {
      id: 'meet-5',
      name: 'Nexus Energy - Technical Discovery',
      participants: 'Sarah Connor',
      dateTime: 'Jan 24, 2025 · 4:00 PM EST',
      purpose: 'Legacy monolith architecture evaluation',
      status: 'Upcoming'
    }
  ];

  const filteredMeetings = meetings.filter(m => {
    if (activeTab === 'UPCOMING' && m.status !== 'Upcoming') return false;
    if (activeTab === 'PAST' && m.status !== 'Completed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || 
             m.participants.toLowerCase().includes(q) ||
             m.purpose.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">All your meetings, briefs and insights</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/meetings/meet-1/brief')}
        >
          <Plus size={16} />
          <span>Add Meeting</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('UPCOMING')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'UPCOMING' ? 'var(--color-brand-primary)' : '#FFFFFF',
            color: activeTab === 'UPCOMING' ? '#FFFFFF' : 'var(--color-text-secondary)',
            border: `1px solid ${activeTab === 'UPCOMING' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
            cursor: 'pointer'
          }}
        >
          Upcoming (3)
        </button>
        <button
          onClick={() => setActiveTab('PAST')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'PAST' ? 'var(--color-brand-primary)' : '#FFFFFF',
            color: activeTab === 'PAST' ? '#FFFFFF' : 'var(--color-text-secondary)',
            border: `1px solid ${activeTab === 'PAST' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
            cursor: 'pointer'
          }}
        >
          Past (8)
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'ALL' ? 'var(--color-brand-primary)' : '#FFFFFF',
            color: activeTab === 'ALL' ? '#FFFFFF' : 'var(--color-text-secondary)',
            border: `1px solid ${activeTab === 'ALL' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
            cursor: 'pointer'
          }}
        >
          All Meetings (11)
        </button>
      </div>

      {/* Search and Action Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 'var(--input-height)',
              paddingLeft: '36px',
              paddingRight: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: '#FFFFFF',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={15} />
          <span>Filter</span>
        </button>
        <button className="btn btn-secondary">
          <ArrowUpDown size={15} />
          <span>Sort</span>
        </button>
      </div>

      {/* Meetings Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Meeting Name</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Participants</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date & Time</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purpose</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeetings.map((m) => (
              <tr 
                key={m.id}
                style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--badge-blue-bg)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={16} />
                    </div>
                    <span>{m.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  {m.participants}
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {m.dateTime}
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', maxWidth: '300px' }}>
                  {m.purpose}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: m.status === 'Upcoming' ? 'var(--badge-blue-bg)' : 'var(--badge-green-bg)',
                    color: m.status === 'Upcoming' ? 'var(--badge-blue-text)' : 'var(--badge-green-text)'
                  }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                    onClick={() => navigate(`/meetings/${m.id}/brief`)}
                  >
                    View Brief
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
