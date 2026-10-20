import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactsApi, type ResearchJobStatus, type SourceItem } from '../../../services/api/contacts.api';
import { Globe, BookOpen, Building2, Newspaper, Search, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const GithubIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#24292F' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { linkedinUrl: string }) => contactsApi.create(data),
    onSuccess: (data) => {
      setJobId(data.id);
      if (data.contact_id) setContactId(data.contact_id);
    },
    onError: (err: any) => {
      alert(`Research initiation failed: ${err.message || 'Unknown error'}`);
    }
  });

  // 1. Live Job Progress Query
  const { data: jobStatus } = useQuery<ResearchJobStatus>({
    queryKey: ['researchJobStatus', jobId],
    queryFn: () => contactsApi.getStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'COMPLETED' || status === 'FAILED' || status === 'PARTIAL') ? false : 1500;
    }
  });

  // 2. Discovered Sources Query (active when job running or complete)
  const { data: sourcesData } = useQuery<{ job_id: string; total_sources: number; sources: SourceItem[] }>({
    queryKey: ['researchJobSources', jobId],
    queryFn: () => contactsApi.getSources(jobId!),
    enabled: !!jobId,
    refetchInterval: () => {
      return (jobStatus?.status === 'COMPLETED' || jobStatus?.status === 'FAILED' || jobStatus?.status === 'PARTIAL') ? false : 2000;
    }
  });

  // Retry Mutation
  const retryMutation = useMutation({
    mutationFn: () => contactsApi.retryJob(jobId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchJobStatus', jobId] });
      queryClient.invalidateQueries({ queryKey: ['researchJobSources', jobId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      createMutation.mutate({ linkedinUrl: url.trim() });
    }
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'github': return <GithubIcon size={18} color="#24292F" />;
      case 'academic_openalex': return <BookOpen size={18} color="#2563EB" />;
      case 'company_web': return <Building2 size={18} color="#4F46E5" />;
      case 'news_public': return <Newspaper size={18} color="#059669" />;
      case 'duckduckgo': return <Search size={18} color="#EA580C" />;
      default: return <Globe size={18} color="#64748B" />;
    }
  };

  // -------------------------------------------------------------
  // VIEW: Live Multi-Source Research Dashboard
  // -------------------------------------------------------------
  if (jobId) {
    const isFinished = jobStatus?.status === 'COMPLETED' || jobStatus?.status === 'PARTIAL' || jobStatus?.status === 'FAILED';
    const resolvedContactId = contactId || jobStatus?.contact_id || jobId;

    return (
      <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 var(--space-4)' }}>
        {/* Header bar */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Multi-Source Person Research</h1>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: jobStatus?.status === 'COMPLETED' ? '#ECFDF5' : jobStatus?.status === 'FAILED' ? '#FEF2F2' : '#EEF2FF',
                  color: jobStatus?.status === 'COMPLETED' ? '#047857' : jobStatus?.status === 'FAILED' ? '#DC2626' : '#4F46E5',
                  border: `1px solid ${jobStatus?.status === 'COMPLETED' ? '#A7F3D0' : jobStatus?.status === 'FAILED' ? '#FECACA' : '#C7D2FE'}`
                }}>
                  {jobStatus?.status || 'QUEUED'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Target Profile: <span style={{ fontFamily: 'monospace', color: '#1E293B' }}>{url || 'LinkedIn Profile'}</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              {jobStatus?.failed_tasks && jobStatus.failed_tasks > 0 && (
                <button
                  type="button"
                  onClick={() => retryMutation.mutate()}
                  disabled={retryMutation.isPending}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <RefreshCw size={14} className={retryMutation.isPending ? 'spin' : ''} />
                  <span>Retry Incomplete ({jobStatus.failed_tasks})</span>
                </button>
              )}

              {isFinished && (
                <button
                  type="button"
                  onClick={() => navigate(`/people/${resolvedContactId}`)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}
                >
                  <span>View Intelligence Report & 360 Workspace</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Metrics strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)'
          }}>
            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 600 }}>Records Discovered</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {jobStatus?.records_discovered ?? 0}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 600 }}>Completed Providers</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                {jobStatus?.completed_tasks ?? 0} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>/ {jobStatus?.total_tasks ?? 0}</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 600 }}>Active Providers</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4F46E5', marginTop: '2px' }}>
                {jobStatus?.active_providers?.length ?? 0}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 600 }}>Failed / Incomplete</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: (jobStatus?.failed_tasks ?? 0) > 0 ? '#DC2626' : '#64748B', marginTop: '2px' }}>
                {jobStatus?.failed_tasks ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Live Providers Grid */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 var(--space-4) 0' }}>Research Providers Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-7)' }}>
          {jobStatus?.tasks && jobStatus.tasks.length > 0 ? (
            jobStatus.tasks.map(t => {
              const isRunning = t.status === 'RUNNING' || t.status === 'PENDING';
              const isSuccess = t.status === 'COMPLETED';
              const isFailed = t.status === 'FAILED';

              return (
                <div key={t.task_id} style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isFailed ? '#FECACA' : isSuccess ? '#D1FAE5' : 'var(--color-border)'}`,
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getSourceIcon(t.source_id)}
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>{t.source_name}</span>
                    </div>
                    {isSuccess && <CheckCircle2 size={16} color="#059669" />}
                    {isFailed && <AlertCircle size={16} color="#DC2626" />}
                    {isRunning && <RefreshCw size={16} color="#4F46E5" className="spin" />}
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Query: <span style={{ fontFamily: 'monospace', color: '#334155' }}>{t.target_query || t.source_id}</span>
                  </div>

                  {t.error ? (
                    <div style={{ fontSize: '11px', color: '#DC2626', background: '#FEF2F2', padding: '4px 8px', borderRadius: '4px' }}>
                      {t.error}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: isSuccess ? '#059669' : '#64748B', fontWeight: 500 }}>
                      {isSuccess ? 'Extraction completed' : isRunning ? 'Retrieving live records...' : 'Queued'}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1' }}>
              Initializing discovery queries and enqueuing providers...
            </div>
          )}
        </div>

        {/* Live Discovered Sources Feed */}
        {sourcesData && sourcesData.sources && sourcesData.sources.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-6)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 var(--space-4) 0' }}>
              Discovered Records & Evidence Sources ({sourcesData.total_sources})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {sourcesData.sources.map((s, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getSourceIcon(s.source_id)}
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>{s.source_name}</span>
                      {s.identity_match_status && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: s.identity_match_status === 'CONFIRMED' ? '#ECFDF5' : '#FFFBEB',
                          color: s.identity_match_status === 'CONFIRMED' ? '#047857' : '#B45309'
                        }}>
                          {s.identity_match_status} ({s.identity_match_confidence}%)
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {s.records_count} record(s) found
                    </span>
                  </div>

                  {s.reference && (
                    <a
                      href={s.reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', wordBreak: 'break-all' }}
                    >
                      {s.reference}
                    </a>
                  )}

                  {s.snippet && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {s.snippet}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Initial Submission Form
  // -------------------------------------------------------------
  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 var(--space-4)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 var(--space-2) 0' }}>
          One-Click Multi-Source Person Intelligence
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: 0 }}>
          Enter a LinkedIn profile URL. NetworkOS will automatically query configured sources (General Web, GitHub, Academic Papers, Company Directories, and Wikidata) to generate an evidence-backed intelligence profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: 'var(--space-7)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
            LinkedIn Profile URL
          </label>
          <input 
            type="url" 
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/username"
            style={{
              width: '100%',
              height: '42px',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '14px'
            }}
          />
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Examples: <span style={{ fontFamily: 'monospace' }}>https://in.linkedin.com/in/pramodkumarthummala</span> or <span style={{ fontFamily: 'monospace' }}>https://www.linkedin.com/in/vanapalli-jaswanth</span>
          </p>
        </div>

        <button 
          type="submit" 
          disabled={createMutation.isPending}
          className="btn btn-primary"
          style={{ width: '100%', height: '42px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {createMutation.isPending ? (
            <>
              <RefreshCw size={16} className="spin" />
              <span>Launching Multi-Source Research...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Research Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
