import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useMeetingCapture } from '../../../hooks/useMeeting';

export const MeetingCaptureWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const captureMutation = useMeetingCapture(id || '');
  const [transcript, setTranscript] = useState('');

  const handleCapture = () => {
    captureMutation.mutate({ transcript }, {
      onSuccess: () => {
        // Direct to Meeting Intelligence for Founder Validation
        navigate(`/meetings/${id}/intelligence`);
      }
    });
  };

  return (
    <WorkspaceShell
      title="Meeting Capture"
      subtitle="Extract candidate intelligence from the meeting."
      breadcrumbs={[
        { label: 'Meeting Brief', path: `/meetings/${id}/brief` },
        { label: 'Capture', path: `/meetings/${id}/capture` }
      ]}
    >
      <div style={{ maxWidth: '800px', background: '#fff', padding: 'var(--space-7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Capture Notes or Transcript</h2>
        <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          NetworkOS will process the input to extract candidate problems, requirements, and people findings.
        </p>
        
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript or raw notes here..."
          style={{ width: '100%', height: '300px', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', marginBottom: 'var(--space-6)' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
          <button 
            className="button-text"
            onClick={() => navigate(`/meetings/${id}/brief`)}
            style={{ padding: 'var(--space-3) var(--space-6)', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            className="button-text"
            onClick={handleCapture}
            disabled={captureMutation.isPending || !transcript.trim()}
            style={{ padding: 'var(--space-3) var(--space-6)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: captureMutation.isPending || !transcript.trim() ? 'not-allowed' : 'pointer' }}
          >
            {captureMutation.isPending ? 'Processing Intelligence...' : 'Extract Intelligence'}
          </button>
        </div>
      </div>
    </WorkspaceShell>
  );
};
