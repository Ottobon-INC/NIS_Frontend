import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptDashboardStats,
  dashboardApi,
  type BackendCockpitStats
} from './dashboard.api.ts';

describe('Dashboard Adapter: adaptDashboardStats', () => {
  it('maps real backend cockpit stats fields to legacy stats structure', () => {
    const raw: BackendCockpitStats = {
      pendingDecisions: 7,
      activeOpportunities: 5,
      networkNodes: 64,
      validatedNeeds: 3,
      introductionsSent: 11
    };

    const res = adaptDashboardStats(raw);
    assert.equal(res.stats.actionRequired, 7);
    assert.equal(res.stats.openOpportunities, 5);
    assert.equal(res.stats.researched, 64);
    assert.equal(res.stats.outcomes, 3);
    assert.equal(res.stats.conversations, 11);
    assert.equal(res.stats.pendingDecisions, 7);
    assert.equal(res.stats.activeOpportunities, 5);
  });

  it('handles nested { stats: ... } objects', () => {
    const raw = {
      stats: {
        actionRequired: 4,
        researched: 12,
        conversations: 5,
        openOpportunities: 3,
        outcomes: 1
      }
    };

    const res = adaptDashboardStats(raw);
    assert.equal(res.stats.actionRequired, 4);
    assert.equal(res.stats.researched, 12);
    assert.equal(res.stats.conversations, 5);
  });

  it('handles null/undefined gracefully', () => {
    const res = adaptDashboardStats(null);
    assert.equal(res.stats.actionRequired, 0);
    assert.equal(res.stats.openOpportunities, 0);
  });
});

describe('dashboardApi Client Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('get() fetches from /api/v1/cockpit/stats', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
        pendingDecisions: 3,
        activeOpportunities: 4,
        networkNodes: 50,
        validatedNeeds: 2,
        introductionsSent: 6
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const res = await dashboardApi.get();
    assert.ok(requestedUrl.includes('/api/v1/cockpit/stats'));
    assert.equal(res.stats.actionRequired, 3);
    assert.equal(res.stats.openOpportunities, 4);
  });

  it('get() falls back to /api/cockpit/stats on 404', async () => {
    let callCount = 0;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      callCount++;
      const url = String(input);
      if (url.includes('/api/v1/cockpit/stats')) {
        return new Response('Not found', { status: 404 });
      }
      return new Response(JSON.stringify({
        pendingDecisions: 2,
        activeOpportunities: 1
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const res = await dashboardApi.get();
    assert.equal(callCount, 2);
    assert.equal(res.stats.actionRequired, 2);
  });

  it('get() propagates 500 server error', async () => {
    globalThis.fetch = async () => {
      return new Response('Server Error', { status: 500 });
    };

    await assert.rejects(
      async () => {
        await dashboardApi.get();
      },
      (err: any) => {
        assert.equal(err.status, 500);
        return true;
      }
    );
  });
});
