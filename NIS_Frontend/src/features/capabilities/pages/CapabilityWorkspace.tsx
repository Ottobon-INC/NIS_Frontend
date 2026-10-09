import React from 'react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useCapabilities } from '../../../hooks/useCapabilities';

export const CapabilityWorkspace: React.FC = () => {
  const { data, isLoading, isError } = useCapabilities();

  return (
    <WorkspaceShell
      title="Capability Intelligence"
      subtitle="Discover internal products, services, expertise, and solutions available for matching."
      breadcrumbs={[
        { label: 'Capabilities', path: '/capabilities' }
      ]}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!data?.capabilities || data.capabilities.length === 0)}
      emptyStateMessage="No capabilities available in the catalog."
    >
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
          {data.capabilities.map(cap => (
            <div 
              key={cap.id} 
              style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-size-lg)' }}>{cap.name}</h3>
                <span className="labels" style={{ color: 'var(--color-brand-primary)', background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  {cap.category}
                </span>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{cap.description}</p>
              </div>

              <div>
                <p className="labels text-secondary" style={{ margin: '0 0 var(--space-2) 0' }}>Relevant Expertise</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {cap.relevantExpertise.map((exp, idx) => (
                    <span key={idx} style={{ fontSize: 'var(--font-size-xs)', background: '#F8FAFC', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Source: {cap.evidenceSource}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
};
