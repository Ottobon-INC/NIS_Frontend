import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkspaceShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; path: string }[];
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryActions?: { label: string; onClick: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }[];
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  children: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  isLoading,
  isError,
  isEmpty,
  emptyStateMessage,
  children
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Workspace Header */}
      <div style={{ marginBottom: 'var(--space-7)' }}>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            {breadcrumbs.map((bc, index) => (
              <React.Fragment key={bc.path}>
                {index > 0 ? <span style={{ color: 'var(--color-text-secondary)' }}>/</span> : null}
                <button 
                  onClick={() => navigate(bc.path)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
                >
                  {bc.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>{subtitle}</p> : null}
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {secondaryActions ? secondaryActions.map(action => (
              <button 
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`btn ${action.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {action.label}
              </button>
            )) : null}
            {primaryAction ? (
              <button 
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="btn btn-primary"
              >
                {primaryAction.label}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div style={{ flex: 1 }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading workspace context...
          </div>
        ) : null}
        
        {isError ? (
          <div style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
            Failed to load workspace context.
          </div>
        ) : null}

        {isEmpty && !isLoading && !isError ? (
          <div style={{ padding: 'var(--space-9) var(--space-8)', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>{emptyStateMessage || 'No items to display.'}</p>
          </div>
        ) : null}

        {!isLoading && !isError && !isEmpty ? children : null}
      </div>
    </div>
  );
};
