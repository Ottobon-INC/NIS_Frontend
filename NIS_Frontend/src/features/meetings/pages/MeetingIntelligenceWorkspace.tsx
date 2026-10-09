import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useMeetingIntelligence } from '../../../hooks/useMeetingIntelligence';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';
import { useUIStore } from '../../../store/uiStore';

export const MeetingIntelligenceWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidenceDrawer } = useUIStore();
  const { data, isLoading, isError, validateFinding } = useMeetingIntelligence(id || '');

  // Local state for editing findings
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  if (!id) return <div>Invalid Meeting ID</div>;

  const handleEditStart = (findingId: string, content: string) => {
    setEditingId(findingId);
    setEditContent(content);
  };

  const handleEditSave = (findingId: string) => {
    validateFinding.mutate({ findingId, status: 'EDITED', newContent: editContent });
    setEditingId(null);
  };

  const allReviewed = data?.findings.every(f => f.status !== 'AWAITING_VALIDATION');

  return (
    <WorkspaceShell
      title="Founder Validation"
      subtitle="Review Candidate Intelligence from the meeting."
      breadcrumbs={[
        { label: 'Meeting Brief', path: `/meetings/${id}/brief` },
        { label: 'Validation', path: `/meetings/${id}/intelligence` }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!data?.findings || data.findings.length === 0)}
      emptyStateMessage="No candidate findings extracted."
      primaryAction={{ 
        label: allReviewed ? 'View Trusted Context' : 'Validation Pending', 
        onClick: () => data?.contactId && navigate(`/people/${data.contactId}/context`),
        disabled: !allReviewed
      }}
    >
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '900px' }}>
          <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
              NetworkOS extracted the following candidate findings. They are <strong>not trusted</strong> until you validate them. 
              Confirmed or edited findings will become part of the Trusted Context.
            </p>
          </div>

          {data.findings.map(finding => (
            <div key={finding.id} style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: `1px solid ${finding.status === 'CONFIRMED' || finding.status === 'EDITED' ? 'var(--color-success)' : finding.status === 'REJECTED' ? 'var(--color-error)' : 'var(--color-border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span className="labels" style={{ padding: '2px 8px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>{finding.type}</span>
                  <TrustBadge level={finding.status === 'CONFIRMED' || finding.status === 'EDITED' ? 'CONFIRMED' : finding.type === 'PERSON' ? 'INFERENCE' : 'HYPOTHESIS'} />
                </div>
                <div className="metadata text-secondary">
                  Confidence: {finding.confidence}%
                </div>
              </div>

              {editingId === finding.id ? (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', minHeight: '80px', marginBottom: 'var(--space-2)' }}
                  />
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button onClick={() => setEditingId(null)} style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-sm)', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => handleEditSave(finding.id)} style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-sm)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Save & Confirm</button>
                  </div>
                </div>
              ) : (
                <p style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-lg)', lineHeight: 1.5 }}>{finding.content}</p>
              )}

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <button 
                  className="button-text"
                  onClick={() => openEvidenceDrawer(finding.id, finding.type === 'PERSON' ? 'SIGNAL' : 'INFERENCE', finding.content)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
                >
                  View Source Evidence
                </button>
              </div>

              {finding.status === 'AWAITING_VALIDATION' ? (
                <div style={{ display: 'flex', gap: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  <button 
                    className="button-text"
                    onClick={() => validateFinding.mutate({ findingId: finding.id, status: 'CONFIRMED' })}
                    disabled={validateFinding.isPending}
                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  >
                    Confirm Finding
                  </button>
                  <button 
                    className="button-text"
                    onClick={() => handleEditStart(finding.id, finding.content)}
                    disabled={validateFinding.isPending}
                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  >
                    Edit & Confirm
                  </button>
                  <button 
                    className="button-text"
                    onClick={() => validateFinding.mutate({ findingId: finding.id, status: 'REJECTED' })}
                    disabled={validateFinding.isPending}
                    style={{ padding: 'var(--space-2) var(--space-4)', background: 'transparent', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="body-text-important" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', color: finding.status === 'REJECTED' ? 'var(--color-error)' : 'var(--color-success)' }}>
                  {finding.status === 'CONFIRMED' && '✓ Confirmed and added to Trusted Context'}
                  {finding.status === 'EDITED' && '✓ Edited and added to Trusted Context'}
                  {finding.status === 'REJECTED' && '✗ Finding rejected'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
};
