import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { meetingsApi } from '../../../services/api/meetings.api';

export const MeetingBrief = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['meetingBrief', id],
    queryFn: () => meetingsApi.getBrief(id!)
  });

  if (isLoading) return <p>Loading conversation brief...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Failed to load brief.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-7)' }}>
        <div>
          <span className="labels text-secondary">Meeting Preparation</span>
          <h1 className="page-title" style={{ marginTop: 'var(--space-1)' }}>Conversation Brief</h1>
        </div>
        <button 
          className="button-text"
          onClick={() => navigate(`/meetings/${id}/capture`)}
          style={{ background: 'var(--color-brand-primary)', color: '#fff', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
        >
          Capture Meeting
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-7)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          {/* Objectives */}
          <div style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Meeting Objectives</h2>
            <ul className="body-text" style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {data.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
          </div>

          {/* Suggested Topics */}
          <div style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Suggested Topics</h2>
            <ul className="body-text" style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {data.suggestedTopics.map((topic, i) => <li key={i}>{topic}</li>)}
            </ul>
          </div>

          {/* Recent Signals */}
          <div style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Recent Signals</h2>
            <ul className="body-text" style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {data.recentSignals.map((signal, i) => <li key={i}>{signal}</li>)}
            </ul>
          </div>
        </div>

        {/* Contact Context Sidebar */}
        <div style={{ background: '#F8FAFC', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', height: 'fit-content' }}>
          <h3 className="labels text-secondary" style={{ marginBottom: 'var(--space-4)' }}>Contact Context</h3>
          
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p className="body-text-important">{data.contactName}</p>
            <p className="body-text text-secondary">{data.company}</p>
            <button 
              className="button-text body-text-important"
              onClick={() => navigate(`/contacts/${data.contactId}`)}
              style={{ color: 'var(--color-brand-primary)', marginTop: 'var(--space-2)' }}
            >
              View Contact 360 &rarr;
            </button>
          </div>

          <div>
            <p className="labels text-secondary" style={{ marginBottom: 'var(--space-2)' }}>RELATIONSHIP</p>
            <p className="body-text">{data.relationshipContext}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
