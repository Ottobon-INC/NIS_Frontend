import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { introductionsApi } from '../../../services/api/introductions.api';

export const MessageReview = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['introDraft', id],
    queryFn: () => introductionsApi.getDraft(id!)
  });

  useEffect(() => {
    if (data?.body) {
      setBody(data.body);
    }
  }, [data]);

  const approveMutation = useMutation({
    mutationFn: () => introductionsApi.approveDraft(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introDraft', id] });
    }
  });

  if (isLoading) return <p>Loading message draft...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Failed to load message draft.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-7)' }}>
        <span className="labels text-secondary">Human Review Required</span>
        <h1 className="page-title" style={{ marginTop: 'var(--space-1)' }}>Review Introduction Draft</h1>
        <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>AI has drafted an introduction based on the opportunity context. Please edit and approve.</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-7)', marginBottom: 'var(--space-7)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="labels" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>To</label>
          <div className="body-text" style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            {data.recipientName}
          </div>
        </div>
        
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="labels" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Subject</label>
          <div className="body-text" style={{ padding: 'var(--space-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            {data.subject}
          </div>
        </div>

        <div>
          <label className="labels" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            Message Body <span className="labels" style={{ color: 'var(--color-brand-primary)', marginLeft: 'var(--space-2)' }}>AI GENERATED DRAFT</span>
          </label>
          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={data.status === 'APPROVED_TO_SEND'}
            rows={10}
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>
      </div>

      {data.status === 'DRAFT' ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-7)' }}>
          <button 
            className="button-text"
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
            style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-3) var(--space-7)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            Approve Introduction
          </button>
        </div>
      ) : (
        <div className="body-text-important" style={{ textAlign: 'right', color: 'var(--color-success)' }}>
          ✓ READY FOR INTRODUCTION: Message approved but not sent.
        </div>
      )}
    </div>
  );
};
