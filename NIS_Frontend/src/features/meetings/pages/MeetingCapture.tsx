import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { meetingsApi } from '../../../services/api/meetings.api';

export const MeetingCapture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);

  const captureMutation = useMutation({
    mutationFn: (data: { transcript: string }) => meetingsApi.capture(id!, data),
    onSuccess: (res) => {
      setJobId(res.jobId);
    }
  });

  const { data: statusData } = useQuery({
    queryKey: ['captureStatus', jobId],
    queryFn: () => meetingsApi.getCaptureStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => query.state.data?.status === 'EXTRACTED' || query.state.data?.status === 'FAILED' ? false : 1000
  });

  useEffect(() => {
    if (statusData?.status === 'EXTRACTED' && statusData.opportunityId) {
      navigate(`/opportunities/${statusData.opportunityId}/validate`);
    }
  }, [statusData, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      captureMutation.mutate({ transcript });
    }
  };

  if (jobId) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2 className="section-title">Analyzing Conversation...</h2>
        <div style={{ marginTop: 'var(--space-7)', padding: 'var(--space-7)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'left' }}>
          <div className="body-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p>✓ Conversation received</p>
            <p>✓ Participants identified</p>
            <p style={{ color: 'var(--color-brand-primary)' }}>↻ Extracting requirements, problems, and people...</p>
          </div>
          <div style={{ marginTop: 'var(--space-7)', height: '4px', background: 'var(--color-bg-primary)', overflow: 'hidden', borderRadius: '2px' }}>
            <div style={{ width: '75%', height: '100%', background: 'var(--color-brand-primary)', transition: 'width 1s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-2)' }}>Conversation Capture</h1>
      <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-7)' }}>Upload meeting audio or paste transcript for AI extraction.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-7)', textAlign: 'center', marginBottom: 'var(--space-7)' }}>
          <p className="body-text-important">Drop audio file here or click to browse</p>
          <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>Supports MP3, WAV, M4A</p>
        </div>

        <div style={{ textAlign: 'center', margin: 'var(--space-4) 0', color: 'var(--color-text-secondary)' }}>OR</div>

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="body-text-important" style={{ display: 'block', marginBottom: '6px' }}>Paste Transcript / Notes</label>
          <textarea
            required
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={8}
            placeholder="Paste meeting transcript here..."
            style={{ width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: 'var(--font-size-sm)' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary"
            type="submit" 
            disabled={captureMutation.isPending || !transcript.trim()}
          >
            {captureMutation.isPending ? 'Processing...' : 'Process Conversation'}
          </button>
        </div>
      </form>
    </div>
  );
};
