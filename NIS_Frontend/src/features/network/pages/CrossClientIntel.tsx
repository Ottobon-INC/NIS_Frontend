import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../../../services/api/network.api';
import { TrustBadge } from '../../../components/intelligence/TrustBadge';

export const CrossClientIntel = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['crossClientInsights'],
    queryFn: networkApi.getInsights
  });

  if (isLoading) return <p>Loading intelligence aggregations...</p>;
  if (isError || !data) return <p style={{ color: 'var(--color-error)' }}>Intelligence aggregation engine currently unavailable.</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-7)' }}>
        <h1 className="page-title">Cross-Client Intelligence</h1>
        <p className="body-text text-secondary" style={{ marginTop: 'var(--space-2)' }}>Anonymized patterns detected across the NetworkOS ecosystem.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {data.insights.map(insight => (
          <div key={insight.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <h3 className="card-title" style={{ margin: 0 }}>{insight.title}</h3>
                <TrustBadge level={insight.isConfirmed ? 'CONFIRMED' : 'INFERENCE'} />
              </div>
              <span className="labels text-secondary" style={{ background: 'var(--color-bg-primary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                {insight.patternStrength} Pattern
              </span>
            </div>

            <p className="body-text text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
              {insight.description}
            </p>

            <div className="body-text-important">
              Found in {insight.relatedNodesCount} active context graphs
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
