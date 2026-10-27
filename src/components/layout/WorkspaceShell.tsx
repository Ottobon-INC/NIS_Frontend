import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkspaceShell.module.css';

interface WorkspaceShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; path: string }[];
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryActions?: { label: string; onClick: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger' }[];
  headerActions?: React.ReactNode;
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
  headerActions,
  isLoading,
  isError,
  isEmpty,
  emptyStateMessage,
  children
}) => {
  const navigate = useNavigate();

  // Only display breadcrumbs if there is an actual hierarchy (> 1 item)
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 1;

  return (
    <div className={styles.shell}>
      {/* Workspace Header */}
      <div className={styles.header}>
        {hasBreadcrumbs ? (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
            {breadcrumbs.map((bc, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={bc.path || index}>
                  {index > 0 ? <span className={styles.breadcrumbSeparator}>/</span> : null}
                  {isLast ? (
                    <span className={styles.breadcrumbCurrent}>{bc.label}</span>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => navigate(bc.path)}
                      className={styles.breadcrumbLink}
                    >
                      {index === 0 && <span aria-hidden="true">←</span>}
                      {bc.label}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        ) : null}

        <div className={styles.titleRow}>
          <div className={styles.titleContainer}>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>
          
          <div className={styles.actionsContainer}>
            {headerActions ? headerActions : null}
            {secondaryActions ? secondaryActions.map(action => (
              <button 
                key={action.label}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`btn ${action.variant === 'primary' ? 'btn-primary' : action.variant === 'danger' ? 'btn-danger' : 'btn-secondary'}`}
              >
                {action.label}
              </button>
            )) : null}
            {primaryAction ? (
              <button 
                type="button"
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
      <div className={styles.contentContainer}>
        {isLoading ? (
          <div className={styles.stateContainer}>
            <p className="body-text text-secondary">Loading workspace context...</p>
          </div>
        ) : null}
        
        {isError ? (
          <div className={styles.stateContainer} style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            <p className="body-text-important">Failed to load workspace context.</p>
          </div>
        ) : null}

        {isEmpty && !isLoading && !isError ? (
          <div className={styles.stateContainer} style={{ borderStyle: 'dashed' }}>
            <p className="body-text text-secondary">{emptyStateMessage || 'No items to display.'}</p>
          </div>
        ) : null}

        {!isLoading && !isError && !isEmpty ? children : null}
      </div>
    </div>
  );
};
