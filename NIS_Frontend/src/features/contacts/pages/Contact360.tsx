import { useParams, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../../../services/api/contacts.api';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'research', label: 'Research' },
  { id: 'roles', label: 'Potential Roles' },
  { id: 'why', label: 'Why Them / Why Us' }
];

export const Contact360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact360', id],
    queryFn: () => contactsApi.get360(id!)
  });

  if (isLoading) return <p>Loading Contact 360...</p>;
  if (!contact) return <p>Contact not found.</p>;

  // Determine current active tab from URL, defaulting to overview
  const currentTab = location.pathname.split('/').pop() || 'overview';
  const activeTab = tabs.find(t => t.id === currentTab) ? currentTab : 'overview';

  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>Contact 360</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-7)' }}>Single source of truth</p>
      
      {/* Contact Header Card */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-6)', marginBottom: 'var(--space-7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', margin: 0 }}>{contact.name}</h2>
            <span className="labels" style={{ background: '#D1FAE5', color: '#065F46', borderRadius: '12px' }}>{contact.relationshipStrength}</span>
            <span className="labels" style={{ background: '#DBEAFE', color: '#1E40AF', borderRadius: '12px' }}>{contact.tier}</span>
            <span className="labels" style={{ background: '#F3E8FF', color: '#6B21A8', borderRadius: '12px' }}>{contact.primaryRole}</span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{contact.title} • {contact.company}</p>
        </div>
        <button 
          onClick={() => navigate('/meetings/meet-1/brief')}
          className="button-text"
          style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)' }}
        >
          Prepare Meeting
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-7)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-7)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(`/contacts/${id}/${tab.id}`)}
            className={activeTab === tab.id ? 'body-text-important' : 'body-text'}
            style={{ 
              paddingBottom: 'var(--space-2)',
              color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-brand-primary)' : '2px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-7)' }}>
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Overview</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-brand-primary)' }} />
                  <span>Recent signal: {contact.recentSignal}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-brand-primary)' }} />
                  <span>Primary door: Buyer</span>
                </li>
              </ul>
            </div>
          } />
          {/* Placeholders for other tabs to prove routing works without full implementation */}
          <Route path="intelligence" element={<div style={{ padding: 'var(--space-7)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Person & Company Intelligence Placeholder</div>} />
          <Route path="relationship" element={<div style={{ padding: 'var(--space-7)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Relationship Context Placeholder</div>} />
          <Route path="research" element={<div style={{ padding: 'var(--space-7)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Public Research Placeholder</div>} />
          <Route path="roles" element={<div style={{ padding: 'var(--space-7)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Potential Roles Placeholder</div>} />
          <Route path="why" element={<div style={{ padding: 'var(--space-7)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Why Them / Why Us Placeholder</div>} />
          <Route path="*" element={<div style={{ padding: 'var(--space-7)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>Coming soon...</div>} />
        </Routes>

        {/* Right Rail (Persistent per wireframe) */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-6)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: 'var(--space-6)' }}>Right rail</h3>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Next action</p>
            <p>Prepare conversation brief</p>
          </div>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Open tasks</p>
            <p className="section-title">2</p>
          </div>
        </div>
      </div>
    </div>
  );
};
