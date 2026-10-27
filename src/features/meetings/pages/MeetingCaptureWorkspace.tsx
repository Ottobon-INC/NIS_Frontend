import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeetingCapture } from '../../../hooks/useMeeting';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const MeetingCaptureWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const captureMutation = useMeetingCapture(id || '');
  const [transcript, setTranscript] = useState('');

  const handleCapture = () => {
    captureMutation.mutate({ transcript }, {
      onSuccess: () => {
        navigate(`/meetings/${id}/intelligence`);
      }
    });
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/meetings/${id}/brief`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Meeting Brief</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="page-title">Capture Meeting Notes &amp; Intelligence</h1>
        <p className="page-subtitle">Paste raw notes, minutes, or transcript to extract verified problems and opportunities</p>
      </div>

      {/* Main Form Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-7)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)'
      }}>
        {/* Info callout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1D4ED8'
        }}>
          <Sparkles size={18} style={{ flexShrink: 0 }} />
          <span>
            NetworkOS AI will parse your notes to identify observed business challenges, technical requirements, and people findings.
          </span>
        </div>

        {/* Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
            Meeting Notes or Raw Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste discussion notes, agenda items, quotes, or verbatim meeting transcript here..."
            style={{
              width: '100%',
              minHeight: '280px',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#0F172A',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Feature Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
            <CheckCircle2 size={13} color="#059669" />
            <span>Problem Extraction</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
            <CheckCircle2 size={13} color="#059669" />
            <span>Requirements Mapping</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
            <CheckCircle2 size={13} color="#059669" />
            <span>Action Item Detection</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-5)'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/meetings/${id}/brief`)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={captureMutation.isPending || !transcript.trim()}
            onClick={handleCapture}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: captureMutation.isPending || !transcript.trim() ? 0.6 : 1,
              cursor: captureMutation.isPending || !transcript.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={15} />
            <span>{captureMutation.isPending ? 'Extracting Intelligence...' : 'Extract Intelligence'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
