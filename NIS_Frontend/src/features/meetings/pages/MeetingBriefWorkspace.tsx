import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useMeeting } from '../../../hooks/useMeeting';

export const MeetingBriefWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: brief, isLoading, isError } = useMeeting(id || '');

  return (
    <WorkspaceShell
      title="Meeting Brief"
      subtitle={brief ? `Preparation for ${brief.contactName} · ${brief.company}` : ''}
      breadcrumbs={[
        { label: 'People', path: '/people' },
        { label: brief?.contactName || 'Contact', path: `/people/${brief?.contactId || '99'}` },
        { label: 'Meeting Brief', path: `/meetings/${id}/brief` }
      ]}
      primaryAction={{ label: 'Capture Meeting', onClick: () => navigate(`/meetings/${id}/capture`) }}
      isLoading={isLoading}
      isError={isError}
      isEmpty={false}
    >
      {brief && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-7)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {/* Objectives */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Meeting Objectives</h2>
              <ul className="body-text" style={{ margin: 0, paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {brief.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </section>

            {/* Suggested Topics */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Suggested Topics</h2>
              <ul className="body-text" style={{ margin: 0, paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {brief.suggestedTopics.map((topic, i) => <li key={i}>{topic}</li>)}
              </ul>
            </section>

            {/* Recent Signals */}
            <section style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h2 className="section-title" style={{ margin: '0 0 var(--space-4) 0' }}>Recent Signals</h2>
              <ul className="body-text" style={{ margin: 0, paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {brief.recentSignals.map((signal, i) => <li key={i}>{signal}</li>)}
              </ul>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Relationship Context</h3>
              <p className="body-text-important" style={{ margin: '0 0 var(--space-2) 0' }}>{brief.contactName}</p>
              <p className="body-text text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>{brief.company}</p>
              <p className="body-text" style={{ margin: 0 }}>{brief.relationshipContext}</p>
              <button 
                className="button-text"
                onClick={() => navigate(`/people/${brief.contactId}`)}
                style={{ marginTop: 'var(--space-4)', background: 'none', border: 'none', color: 'var(--color-brand-primary)', cursor: 'pointer', padding: 0 }}
              >
                Return to Contact 360 &rarr;
              </button>
            </section>
            
            <section style={{ background: 'var(--color-bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="labels text-secondary" style={{ margin: '0 0 var(--space-4) 0' }}>Trusted Context</h3>
              <p className="body-text text-secondary" style={{ margin: 0 }}>Review verified intelligence before the meeting.</p>
              <button 
                className="button-text"
                onClick={() => navigate(`/people/${brief.contactId}/context`)}
                style={{ marginTop: 'var(--space-4)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-4)', cursor: 'pointer' }}
              >
                View Trusted Context
              </button>
            </section>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
