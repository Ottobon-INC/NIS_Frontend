import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../../../services/api/network.api';

export const NetworkMap = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['networkGraph'],
    queryFn: networkApi.getGraph
  });

  if (isLoading) return <p>Loading bounded network graph...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Failed to load network graph.</p>;

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h1 className="page-title">Ecosystem Map</h1>
        <p className="body-text text-secondary">Visualizing immediate connections and validated pathways.</p>
      </div>

      <div style={{ flex: 1, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-7)' }}>[Graph Visualization Placeholder]</p>
          <div style={{ display: 'flex', gap: 'var(--space-9)', justifyContent: 'center' }}>
            <div style={{ padding: 'var(--space-4)', border: '2px solid var(--color-border)', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span className="labels text-secondary">PERSON</span>
              <span className="body-text-important">{data.nodes[0]?.label}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="labels" style={{ color: 'var(--color-brand-primary)', padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: '16px' }}>
                {data.edges[1]?.label}
              </span>
            </div>

            <div style={{ padding: 'var(--space-4)', border: '2px solid var(--color-brand-primary)', borderRadius: 'var(--radius-lg)', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'var(--color-bg-primary)' }}>
              <span className="labels" style={{ color: 'var(--color-brand-primary)' }}>COMPANY</span>
              <span className="body-text-important" style={{ textAlign: 'center' }}>{data.nodes[2]?.label}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="labels" style={{ color: 'var(--color-brand-primary)', padding: 'var(--space-2) var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: '16px' }}>
                {data.edges[0]?.label}
              </span>
            </div>

            <div style={{ padding: 'var(--space-4)', border: '2px dashed var(--color-border)', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span className="labels text-secondary">PERSON</span>
              <span className="body-text-important">{data.nodes[1]?.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
