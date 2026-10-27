import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  X,
  Sparkles,
  MessageSquare,
  Mail,
  PhoneCall,
  ExternalLink
} from 'lucide-react';

interface IntroductionRow {
  id: string;
  opportunityId: string;
  recipientName: string;
  targetCompany: string;
  intermediary: string;
  sentDate: string;
  status: 'In Progress' | 'Draft' | 'Sent' | 'Completed';
  statusBadge: { bg: string; text: string; border: string };
  actionPath: string;
  actionLabel: string;
}

const DEFAULT_INTRODUCTIONS: IntroductionRow[] = [
  {
    id: 'intro-1',
    opportunityId: 'opp-fintech-fraud-02',
    recipientName: 'Alex Chen',
    targetCompany: 'TechCorp',
    intermediary: 'Priya Sharma (Horizon VC)',
    sentDate: 'Jan 16, 2025',
    status: 'In Progress',
    statusBadge: { bg: 'var(--badge-amber-bg)', text: 'var(--badge-amber-text)', border: '#FDE68A' },
    actionPath: '/opportunities/opp-fintech-fraud-02/post-introduction',
    actionLabel: 'Track Progress'
  },
  {
    id: 'intro-2',
    opportunityId: 'opp-logistics-01',
    recipientName: 'Rahul Dhamdhere',
    targetCompany: 'Global Logistics Corp',
    intermediary: 'Bhanu Connection',
    sentDate: 'Jan 19, 2025',
    status: 'Draft',
    statusBadge: { bg: 'var(--badge-blue-bg)', text: 'var(--badge-blue-text)', border: '#BFDBFE' },
    actionPath: '/opportunities/opp-fintech-fraud-02/introduction',
    actionLabel: 'Review Draft'
  },
  {
    id: 'intro-3',
    opportunityId: 'opp-cyberdyne-01',
    recipientName: 'Sarah Connor',
    targetCompany: 'Cyberdyne Systems',
    intermediary: 'Direct Network',
    sentDate: 'Jan 14, 2025',
    status: 'Sent',
    statusBadge: { bg: 'var(--badge-green-bg)', text: 'var(--badge-green-text)', border: '#A7F3D0' },
    actionPath: '/opportunities/opp-fintech-fraud-02/post-introduction',
    actionLabel: 'View Thread'
  }
];

const AVAILABLE_OPPORTUNITIES = [
  { id: 'opp-fintech-fraud-02', title: 'Enterprise Agent Compliance Pilot', company: 'TechCorp' },
  { id: 'opp-logistics-01', title: 'Autonomous SAP S/4HANA Migration', company: 'Global Logistics Corp' },
  { id: 'opp-cyberdyne-01', title: 'Edge AI Governance & Sensor Mesh', company: 'Cyberdyne Systems' }
];

const AVAILABLE_CONNECTORS = [
  { name: 'Priya Sharma', org: 'Horizon VC', role: 'Managing Partner', strength: 'Strong' },
  { name: 'David Kim', org: 'MediTech Ventures', role: 'General Partner', strength: 'Strong' },
  { name: 'Emma Wilson', org: 'CloudScale Capital', role: 'VP Growth', strength: 'Moderate' },
  { name: 'Bhanu (Founder)', org: 'Direct Network', role: 'Founder & CEO', strength: 'Direct' }
];

export const IntroductionsWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DRAFTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [introductions, setIntroductions] = useState<IntroductionRow[]>(DEFAULT_INTRODUCTIONS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State inside Modal
  const [selectedOppId, setSelectedOppId] = useState(AVAILABLE_OPPORTUNITIES[0].id);
  const [selectedConnectorIndex, setSelectedConnectorIndex] = useState(0);
  const [targetContactName, setTargetContactName] = useState('Alex Chen');
  const [targetCompanyName, setTargetCompanyName] = useState('TechCorp');
  const [channel, setChannel] = useState<'EMAIL' | 'LINKEDIN' | 'PHONE'>('EMAIL');
  const [rationale, setRationale] = useState('Strategic investor with high credibility among enterprise CTO buying committees.');
  const [draftBody, setDraftBody] = useState(
    `Hi Priya,\n\nFollowing up on our discussions on agentic automation, Ottobon has engineered a bounded compliance bridge for enterprise AI agents on Azure and AWS.\n\nWould you be open to introducing us to Alex Chen at TechCorp next week? We would welcome sharing our 2-week pilot benchmark with their team.\n\nBest,\nNetworkOS Founder`
  );

  const handleGenerateAIDraft = () => {
    const connector = AVAILABLE_CONNECTORS[selectedConnectorIndex];
    const opp = AVAILABLE_OPPORTUNITIES.find(o => o.id === selectedOppId) || AVAILABLE_OPPORTUNITIES[0];
    
    setDraftBody(
      `Hi ${connector.name.split(' ')[0]},\n\nI hope you're having a productive week! Following our discussions around ${opp.title.toLowerCase()}, Ottobon has achieved critical validation on our enterprise platform.\n\nGiven your relationship with ${targetContactName || 'the executive team'} at ${targetCompanyName || opp.company}, would you feel comfortable making a warm introduction so we could share our 2-week pilot benchmark?\n\nReally appreciate your support!\n\nBest,\nNetworkOS Founder`
    );
  };

  const handleCreateIntroduction = (proceedToWorkspace: boolean) => {
    const connector = AVAILABLE_CONNECTORS[selectedConnectorIndex];
    const opp = AVAILABLE_OPPORTUNITIES.find(o => o.id === selectedOppId) || AVAILABLE_OPPORTUNITIES[0];
    const newId = `intro-${Date.now()}`;

    const newIntro: IntroductionRow = {
      id: newId,
      opportunityId: opp.id,
      recipientName: targetContactName || 'Executive Lead',
      targetCompany: targetCompanyName || opp.company,
      intermediary: `${connector.name} (${connector.org})`,
      sentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Draft',
      statusBadge: { bg: 'var(--badge-blue-bg)', text: 'var(--badge-blue-text)', border: '#BFDBFE' },
      actionPath: `/opportunities/${opp.id}/introduction`,
      actionLabel: 'Review Draft'
    };

    setIntroductions(prev => [newIntro, ...prev]);
    setIsModalOpen(false);

    if (proceedToWorkspace) {
      navigate(`/opportunities/${opp.id}/introduction`);
    } else {
      setToastMessage(`Introduction request drafted for ${targetContactName || 'Executive Lead'}.`);
      setActiveTab('DRAFTS');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filtered = introductions.filter(item => {
    if (activeTab === 'ACTIVE' && item.status !== 'In Progress' && item.status !== 'Sent') return false;
    if (activeTab === 'DRAFTS' && item.status !== 'Draft') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.recipientName.toLowerCase().includes(q) ||
             item.targetCompany.toLowerCase().includes(q) ||
             item.intermediary.toLowerCase().includes(q);
    }
    return true;
  });

  const inProgressCount = introductions.filter(i => i.status === 'In Progress').length;
  const draftCount = introductions.filter(i => i.status === 'Draft').length;
  const sentCount = introductions.filter(i => i.status === 'Sent' || i.status === 'Completed').length;

  return (
    <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '12px 18px',
          borderRadius: '10px',
          color: '#065F46',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Introductions</h1>
          <p className="page-subtitle">Prepare, send, and track executive warm network introductions</p>
        </div>
        <button 
          id="btn-new-introduction"
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Introduction</span>
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: '#EFF6FF',
            color: 'var(--color-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Send size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Introductions
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{introductions.length}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Active</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: '#FEF3C7',
            color: '#B45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{inProgressCount}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Awaiting meeting</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: '#F1F5F9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Drafts
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{draftCount}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Pending review</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: '#ECFDF5',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sent &amp; Completed
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{sentCount}</span>
              <span style={{ fontSize: '12px', color: '#059669' }}>Dispatched</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Pills & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          background: '#E2E8F0',
          padding: '3px',
          borderRadius: '8px',
          gap: '2px'
        }}>
          {[
            { id: 'ALL', label: `All Introductions (${introductions.length})` },
            { id: 'ACTIVE', label: `Active (${inProgressCount + sentCount})` },
            { id: 'DRAFTS', label: `Drafts (${draftCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-brand-primary)' : '#475569',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text"
              placeholder="Search introductions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                width: '240px'
              }}
            />
          </div>

          <button 
            className="btn btn-secondary"
            style={{ height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Filter size={15} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Introductions Enterprise Data Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ width: '40px', padding: '12px 16px' }}>
                <input 
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(filtered.map(i => i.id));
                    else setSelectedIds([]);
                  }}
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recipient &amp; Target
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Intermediary / Connector
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Sent Date</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Status
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr 
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: isSelected ? '#F0F9FF' : '#FFFFFF',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) setSelectedIds(selectedIds.filter(id => id !== item.id));
                        else setSelectedIds([...selectedIds, item.id]);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: '#EEF2FF',
                        color: 'var(--color-brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {item.recipientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div>{item.recipientName}</div>
                        <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-secondary)' }}>{item.targetCompany}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    {item.intermediary}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {item.sentDate}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: item.statusBadge.bg,
                      color: item.statusBadge.text,
                      border: `1px solid ${item.statusBadge.border}`
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ height: '32px', padding: '0 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => navigate(item.actionPath)}
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Request New Introduction */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    Request New Introduction
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Calibrate a warm executive introduction through your verified network
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Linked Strategic Opportunity */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Target Opportunity
                </label>
                <select
                  value={selectedOppId}
                  onChange={(e) => {
                    setSelectedOppId(e.target.value);
                    const matched = AVAILABLE_OPPORTUNITIES.find(o => o.id === e.target.value);
                    if (matched) setTargetCompanyName(matched.company);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  {AVAILABLE_OPPORTUNITIES.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} ({opp.company})
                    </option>
                  ))}
                </select>
              </div>

              {/* Intermediary / Connector Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Warm Connector / Intermediary
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {AVAILABLE_CONNECTORS.map((connector, idx) => {
                    const isSelected = selectedConnectorIndex === idx;
                    return (
                      <div
                        key={connector.name}
                        onClick={() => setSelectedConnectorIndex(idx)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: `1.5px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? '#2563EB' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {connector.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {connector.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {connector.org} · <strong style={{ color: connector.strength === 'Strong' ? '#047857' : '#2563EB' }}>{connector.strength}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target Recipient details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Target Recipient
                  </label>
                  <input
                    type="text"
                    value={targetContactName}
                    onChange={(e) => setTargetContactName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Target Organization
                  </label>
                  <input
                    type="text"
                    value={targetCompanyName}
                    onChange={(e) => setTargetCompanyName(e.target.value)}
                    placeholder="e.g. TechCorp"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Channel Strip */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Outreach Channel
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { key: 'EMAIL', label: 'Email', icon: Mail },
                    { key: 'LINKEDIN', label: 'LinkedIn', icon: MessageSquare },
                    { key: 'PHONE', label: 'Phone / Direct', icon: PhoneCall },
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = channel === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setChannel(item.key as any)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? '#2563EB' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strategic Rationale */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Strategic Angle / Rationale
                </label>
                <input
                  type="text"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Why this connection is positioned to introduce us"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Calibrated Message Draft */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                    Calibrated Introduction Draft
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDraft}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Regenerate with AI</span>
                  </button>
                </div>
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    color: '#0F172A',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary"
                style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCreateIntroduction(false)}
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateIntroduction(true)}
                  className="btn btn-primary"
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Open Full Workspace</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
