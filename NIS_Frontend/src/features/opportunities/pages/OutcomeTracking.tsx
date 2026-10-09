import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { opportunitiesApi } from '../../../services/api/opportunities.api';

export const OutcomeTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState('ACCEPTED');
  const [notes, setNotes] = useState('');

  const outcomeMutation = useMutation({
    mutationFn: () => opportunitiesApi.postOutcome(id!, outcome, notes),
    onSuccess: () => alert('Outcome recorded successfully. Feedback sent to learning loop.')
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-7)' }}>
        <span className="labels text-secondary">Feedback Loop</span>
        <h1 className="page-title" style={{ marginTop: 'var(--space-1)' }}>Log Opportunity Outcome</h1>
        <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>Did the proposed introduction proceed? Your feedback improves future network intelligence.</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-7)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="card-title" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Observed Outcome</label>
          <select 
            value={outcome} 
            onChange={e => setOutcome(e.target.value)}
            disabled={outcomeMutation.isSuccess}
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
          >
            <option value="ACCEPTED">Meeting Accepted</option>
            <option value="DECLINED">Meeting Declined</option>
            <option value="NO_RESPONSE">No Response</option>
            <option value="WRONG_FIT">Wrong Fit (AI Error)</option>
          </select>
        </div>

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="card-title" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Founder Feedback Notes</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            disabled={outcomeMutation.isSuccess}
            rows={5}
            placeholder="Why did this outcome occur?"
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
          />
        </div>

        {outcomeMutation.isSuccess ? (
          <div className="body-text-important" style={{ padding: 'var(--space-4)', background: 'var(--color-bg-primary)', color: 'var(--color-success)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            ✓ Feedback Loop Completed
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
            <button 
              className="button-text"
              onClick={() => navigate('/opportunities/board')}
              style={{ padding: 'var(--space-3) var(--space-7)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer' }}
            >
              Skip
            </button>
            <button 
              className="button-text"
              disabled={outcomeMutation.isPending}
              onClick={() => outcomeMutation.mutate()}
              style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-3) var(--space-7)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              {outcomeMutation.isPending ? 'Logging...' : 'Submit Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
