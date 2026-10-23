import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactsApi, type ResearchJobStatus } from '../../../services/api/contacts.api';
import { RefreshCw, AlertCircle, ArrowRight, Search } from 'lucide-react';

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

  // Retry Mutation
  const retryMutation = useMutation({
    mutationFn: () => contactsApi.retryJob(jobId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchJobStatus', jobId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      createMutation.mutate({ linkedinUrl: url.trim() });
    }
  };

  // Automatically navigate directly to the next step (Contact 360 Workspace) once research completes
  React.useEffect(() => {
    if (jobId && jobStatus) {
      const isDone = jobStatus.status === 'COMPLETED' || jobStatus.status === 'PARTIAL';
      if (isDone) {
        const targetId = contactId || jobStatus.contact_id || jobId;
        navigate(`/people/${targetId}`, { replace: true });
      }
    }
  }, [jobId, jobStatus, contactId, navigate]);

  // -------------------------------------------------------------
  // VIEW: Clean Loading State (Hides raw provider grid, transitions directly)
  // -------------------------------------------------------------
  if (jobId) {
    const isFailed = jobStatus?.status === 'FAILED';
    const isFinished = jobStatus?.status === 'COMPLETED' || 
                       jobStatus?.status === 'PARTIAL' || 
                       isFailed ||
                       (Boolean(jobStatus && jobStatus.total_tasks > 0 && 
                        (jobStatus.pending_tasks === 0 || 
                         (jobStatus.completed_tasks + jobStatus.failed_tasks >= jobStatus.total_tasks && (jobStatus.active_providers?.length ?? 0) === 0))));
    const resolvedContactId = contactId || jobStatus?.contact_id || jobId;

    const totalTasks = jobStatus?.total_tasks || 8;
    const completedTasks = jobStatus?.completed_tasks || 0;
    const failedTasks = jobStatus?.failed_tasks || 0;
    const finishedCount = completedTasks + failedTasks;
    const progressPercent = isFinished 
      ? 100 
      : Math.min(95, Math.max(10, Math.round((finishedCount / (totalTasks || 1)) * 100)));

    if (isFailed) {
      return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 var(--space-4)' }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #FECACA',
            padding: 'var(--space-8)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <AlertCircle size={28} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#991B1B', margin: '0 0 var(--space-2) 0' }}>
              Research Could Not Complete
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 var(--space-6) 0', lineHeight: 1.5 }}>
              We encountered an issue querying external providers for this profile. You can retry the research or proceed directly to the profile workspace.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => retryMutation.mutate()}
                disabled={retryMutation.isPending}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={retryMutation.isPending ? 'spin' : ''} />
                <span>Retry Research</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/people/${resolvedContactId}`)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Open 360 Workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '560px', margin: '5rem auto', padding: '0 var(--space-4)' }}>
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-9) var(--space-7)',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle animated gradient top accent bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #3B82F6, #6366F1, #8B5CF6, #3B82F6)',
            backgroundSize: '200% 100%',
            animation: 'gradientShift 2s linear infinite'
          }} />

          {/* Premium animated loading icon */}
          <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto var(--space-6)' }}>
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0) 70%)',
              animation: 'pulseGlow 2s ease-in-out infinite'
            }} />
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '1px solid #C7D2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand-primary)'
            }}>
              <RefreshCw size={36} className="spin" style={{ animationDuration: '1.2s' }} />
            </div>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 var(--space-2) 0', letterSpacing: '-0.02em' }}>
            Gathering Intelligence...
          </h2>

          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 var(--space-6) 0' }}>
            Analyzing candidate credentials, verifying public affiliations, and grounding commercial product opportunities.
          </p>

          {/* Modern Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: '#F1F5F9',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.max(progressPercent, 20)}%`,
              background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)',
              borderRadius: '999px',
              transition: 'width 0.5s ease-in-out'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94A3B8', marginBottom: 'var(--space-6)' }}>
            <span>
              {jobStatus?.completed_tasks && jobStatus?.total_tasks
                ? `${jobStatus.completed_tasks} of ${jobStatus.total_tasks} sources analyzed`
                : 'Connecting intelligence providers...'}
            </span>
            <span style={{ fontWeight: 600, color: '#64748B' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Target URL indicator badge */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#475569',
            maxWidth: '100%'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3B82F6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)'
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Target: <strong style={{ color: '#1E293B' }}>{url || 'LinkedIn Profile'}</strong>
            </span>
          </div>

          {/* Records discovered preview badge if already found */}
          {(jobStatus?.records_discovered ?? 0) > 0 && (
            <div style={{
              marginTop: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#059669',
              fontWeight: 600
            }}>
              <span>•</span>
              <span>{jobStatus?.records_discovered} evidence record(s) discovered</span>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
              Directly loading 360 Workspace upon completion...
            </p>
            {resolvedContactId && (
              <button
                type="button"
                onClick={() => navigate(`/people/${resolvedContactId}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Preview Contact 360 early</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          <style>{`
            @keyframes pulseGlow {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.15); opacity: 0.9; }
            }
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
        </div>
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
