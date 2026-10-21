import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Building2, Briefcase, Cpu, Sparkles, RefreshCw, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, TrendingUp, Edit3, X } from 'lucide-react';
import { contactsApi, type CompanyIntelligenceData } from '../../../services/api/contacts.api';

interface CompanyIntelligenceCardProps {
  contactId: string;
  companyName: string;
  onCompanyUpdated?: (newCompany: string) => void;
}

export const CompanyIntelligenceCard: React.FC<CompanyIntelligenceCardProps> = ({
  contactId,
  companyName,
  onCompanyUpdated
}) => {
  const queryClient = useQueryClient();
  const [showFullReport, setShowFullReport] = useState(false);

  const isPlaceholderName = (name?: string) => {
    if (!name) return true;
    const clean = name.trim().toLowerCase();
    return clean === '[unverified]' || clean === 'unverified' || clean === 'unknown' || clean === 'pending research' || clean === 'none' || clean === 'n/a';
  };

  const isInitialUnverified = isPlaceholderName(companyName);
  const [isEditingName, setIsEditingName] = useState(isInitialUnverified);
  const [inputCompanyName, setInputCompanyName] = useState(isInitialUnverified ? '' : companyName);

  useEffect(() => {
    if (!isPlaceholderName(companyName)) {
      setInputCompanyName(companyName);
      if (!isEditingName) {
        setIsEditingName(false);
      }
    }
  }, [companyName]);

  // 1. Fetch persisted company intelligence from DB
  const { data: intel } = useQuery<CompanyIntelligenceData | null>({
    queryKey: ['companyIntelligence', contactId],
    queryFn: async () => {
      try {
        const res = await contactsApi.getCompanyIntelligence(contactId);
        if (res && isPlaceholderName(res.company_name)) {
          return null;
        }
        return res;
      } catch (err: any) {
        if (err.status === 404 || err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    retry: false
  });

  // 2. Mutation to extract & store in DB
  const extractMutation = useMutation({
    mutationFn: (targetCompany: string) => contactsApi.extractCompanyIntelligence(contactId, targetCompany),
    onSuccess: (newData) => {
      queryClient.setQueryData(['companyIntelligence', contactId], newData);
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contact360', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsEditingName(false);
      if (newData.company_name && onCompanyUpdated) {
        onCompanyUpdated(newData.company_name);
      }
    },
    onError: (err: any) => {
      const msg = err.data?.detail || err.data?.error?.message || err.response?.data?.detail || err.message || 'Error occurred';
      alert(`Company intelligence extraction failed: ${msg}`);
    }
  });

  const isExtracting = extractMutation.isPending;

  const handleExtract = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = inputCompanyName.trim() || (!isPlaceholderName(companyName) ? companyName : '');
    if (!target) {
      alert('Please enter a company name (e.g. "Ottobon") to extract intelligence.');
      return;
    }
    extractMutation.mutate(target);
  };

  // Hiring Status Badge
  const getHiringBadge = (status?: string, isHiring?: boolean) => {
    if (status === 'ACTIVELY_HIRING' || (isHiring && status !== 'LOW_OR_NONE')) {
      return {
        label: '🟢 Actively Hiring',
        bg: '#ECFDF5',
        color: '#065F46',
        border: '#A7F3D0'
      };
    }
    if (status === 'MODERATE') {
      return {
        label: '🟡 Moderate Hiring',
        bg: '#FFFBEB',
        color: '#92400E',
        border: '#FDE68A'
      };
    }
    if (status === 'LOW_OR_NONE') {
      return {
        label: '⚪ Low / No Openings',
        bg: '#F8FAFC',
        color: '#64748B',
        border: '#E2E8F0'
      };
    }
    return {
      label: '⚪ Hiring Unknown',
      bg: '#F8FAFC',
      color: '#64748B',
      border: '#E2E8F0'
    };
  };

  const hiringBadge = intel ? getHiringBadge(intel.hiring_status, intel.is_hiring) : null;
  const activeDisplayCompany = intel?.company_name || (!isPlaceholderName(companyName) ? companyName : '');

  return (
    <section style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: '280px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: '#EEF2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand-primary)',
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>

          <div style={{ flex: 1 }}>
            {isEditingName ? (
              <form onSubmit={handleExtract} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={inputCompanyName}
                  onChange={(e) => setInputCompanyName(e.target.value)}
                  placeholder="Enter company name (e.g. Ottobon)"
                  disabled={isExtracting}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid #4F46E5',
                    outline: 'none',
                    minWidth: '240px',
                    color: '#0F172A'
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isExtracting || !inputCompanyName.trim()}
                  className="btn btn-primary"
                  style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: 600 }}
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw size={13} className="spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Extract Live Intel</span>
                    </>
                  )}
                </button>
                {activeDisplayCompany && !isPlaceholderName(activeDisplayCompany) && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputCompanyName(activeDisplayCompany);
                      setIsEditingName(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <X size={15} /> Cancel
                  </button>
                )}
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {activeDisplayCompany || 'Company Intelligence'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setInputCompanyName(activeDisplayCompany);
                      setIsEditingName(true);
                    }}
                    title="Edit company name"
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Change</span>
                  </button>
                  {intel?.website && (
                    <a
                      href={intel.website.startsWith('http') ? intel.website : `https://${intel.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', color: '#64748B', fontSize: '12px', gap: '3px' }}
                      title="Visit company website"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  {intel?.industry || 'Enterprise & Technology Sector'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {hiringBadge && (
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: hiringBadge.bg,
              color: hiringBadge.color,
              border: `1px solid ${hiringBadge.border}`
            }}>
              {hiringBadge.label}
            </span>
          )}

          {intel && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#059669',
              background: '#F0FDF4',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid #BBF7D0'
            }}>
              <CheckCircle2 size={12} />
              <span>Stored in DB</span>
            </span>
          )}

          {!isEditingName && (
            <button
              type="button"
              onClick={() => handleExtract()}
              disabled={isExtracting}
              className="btn btn-primary"
              style={{
                height: '34px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Extracting Live Intelligence...</span>
                </>
              ) : intel ? (
                <>
                  <RefreshCw size={13} />
                  <span>Refresh Company Intel</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Extract Company Intelligence</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      {isExtracting ? (
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed #CBD5E1'
        }}>
          <RefreshCw size={26} className="spin" style={{ color: 'var(--color-brand-primary)', margin: '0 auto 12px auto', display: 'block' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B', margin: '0 0 6px 0' }}>
            Gathering Verified Intelligence for {inputCompanyName || activeDisplayCompany || 'Company'}...
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '540px', margin: '0 auto' }}>
            Querying corporate web pages, digital implementation case studies, tech architectures, and current job openings. Synthesizing verified intelligence and persisting to database...
          </p>
        </div>
      ) : intel ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          
          {/* 3 Pillars Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            {/* 1. What they do */}
            <div style={{
              background: '#F8FAFC',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} color="#4F46E5" />
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', margin: 0 }}>
                  What They Do
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#1E293B' }}>
                {intel.overview || 'Detailed overview pending analysis.'}
              </p>
            </div>

            {/* 2. What they have implemented */}
            <div style={{
              background: '#F8FAFC',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={16} color="#059669" />
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', margin: 0 }}>
                  What They Have Implemented
                </h3>
              </div>
              <div style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#1E293B' }}>
                {intel.what_they_implemented || 'Architecture and platform modernizations pending analysis.'}
              </div>

              {intel.technologies_used && intel.technologies_used.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {intel.technologies_used.map((tech, idx) => (
                    <span key={idx} style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#fff',
                      border: '1px solid #CBD5E1',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      color: '#334155'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Hiring & Growth signals */}
            <div style={{
              background: '#F8FAFC',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="#D97706" />
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', margin: 0 }}>
                  Hiring & Growth Demand
                </h3>
              </div>
              
              <div style={{ fontSize: '13px', fontWeight: 600, color: intel.is_hiring ? '#059669' : '#64748B' }}>
                {intel.is_hiring ? '✓ Active talent recruitment detected' : 'No prominent hiring surge detected'}
              </div>

              {intel.hiring_roles && intel.hiring_roles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    Open Roles & Expanding Teams:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {intel.hiring_roles.map((role, idx) => (
                      <span key={idx} style={{
                        fontSize: '11px',
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FDE68A',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        • {role}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                  No open roles found in recent web indexes.
                </p>
              )}
            </div>
          </div>

          {/* Key Initiatives Strip */}
          {intel.key_initiatives && intel.key_initiatives.length > 0 && (
            <div style={{
              padding: 'var(--space-4)',
              background: '#EEF2FF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #C7D2FE'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <TrendingUp size={15} color="#4F46E5" />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#3730A3', letterSpacing: '0.04em' }}>
                  Strategic Initiatives & Milestones:
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {intel.key_initiatives.map((init, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#1E1B4B', background: '#fff', padding: '4px 10px', borderRadius: '4px', border: '1px solid #E0E7FF' }}>
                    📌 {init}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Full Report */}
          {intel.summary_markdown && (
            <div>
              <button
                type="button"
                onClick={() => setShowFullReport(!showFullReport)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-brand-primary)',
                  padding: '6px 0',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
              >
                <span>{showFullReport ? 'Hide Complete Company Report' : 'Read Deep-Dive Company Intelligence Report'}</span>
                {showFullReport ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showFullReport && (
                <div style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-6)',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  lineHeight: '1.6'
                }}>
                  <div className="markdown-body">
                    <ReactMarkdown>{intel.summary_markdown}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* Empty State Prompt */
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed #CBD5E1'
        }}>
          <Building2 size={30} style={{ color: '#94A3B8', margin: '0 auto 8px auto', display: 'block' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B', margin: '0 0 6px 0' }}>
            {activeDisplayCompany ? `Company Intelligence for "${activeDisplayCompany}"` : 'Company Intelligence Not Yet Analyzed'}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '520px', margin: '0 auto 14px auto', lineHeight: 1.5 }}>
            {activeDisplayCompany
              ? `Click below to extract what ${activeDisplayCompany} does, their technical platforms, tech stack, and hiring demand. Intelligence will be saved directly to your database.`
              : 'Enter the company name above to extract company overview, implemented architectures, and hiring signals.'}
          </p>
          <button
            type="button"
            onClick={() => handleExtract()}
            disabled={isExtracting || (!activeDisplayCompany && !inputCompanyName.trim())}
            className="btn btn-primary"
            style={{ fontSize: '13px', height: '36px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>Research Company & Hiring Signals</span>
          </button>
        </div>
      )}
    </section>
  );
};
