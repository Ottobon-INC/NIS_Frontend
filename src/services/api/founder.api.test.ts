import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptFounderDecisionItem,
  adaptFounderDecisionQueue,
  mapBackendDecisionType,
  founderApi,
  type BackendDecisionQueueItem
} from './founder.api.ts';

describe('Founder Decision Adapter: mapBackendDecisionType', () => {
  it('maps OPPORTUNITY_VALIDATION to VALIDATION_REQUIRED', () => {
    assert.equal(mapBackendDecisionType('OPPORTUNITY_VALIDATION'), 'VALIDATION_REQUIRED');
  });

  it('maps NETWORK_MATCH_APPROVAL to MATCH_REVIEW_REQUIRED', () => {
    assert.equal(mapBackendDecisionType('NETWORK_MATCH_APPROVAL'), 'MATCH_REVIEW_REQUIRED');
  });

  it('maps INTRODUCTION_REVIEW to INTRODUCTION_REVIEW_REQUIRED', () => {
    assert.equal(mapBackendDecisionType('INTRODUCTION_REVIEW'), 'INTRODUCTION_REVIEW_REQUIRED');
  });

  it('maps OUTCOME_REVIEW to OUTCOME_REVIEW_REQUIRED', () => {
    assert.equal(mapBackendDecisionType('OUTCOME_REVIEW'), 'OUTCOME_REVIEW_REQUIRED');
  });

  it('preserves existing frontend DecisionType unions', () => {
    assert.equal(mapBackendDecisionType('VALIDATION_REQUIRED'), 'VALIDATION_REQUIRED');
    assert.equal(mapBackendDecisionType('MATCH_REVIEW_REQUIRED'), 'MATCH_REVIEW_REQUIRED');
  });

  it('defaults unknown or undefined types to VALIDATION_REQUIRED', () => {
    assert.equal(mapBackendDecisionType(undefined), 'VALIDATION_REQUIRED');
    assert.equal(mapBackendDecisionType('UNKNOWN_TYPE'), 'VALIDATION_REQUIRED');
  });
});

describe('Founder Decision Adapter: adaptFounderDecisionItem', () => {
  it('parses real backend cockpit queue item structure correctly', () => {
    const raw: BackendDecisionQueueItem = {
      id: 'dec-01',
      type: 'OPPORTUNITY_VALIDATION',
      priority: 'HIGH',
      title: 'Validate Detected Opportunity',
      subtitle: 'David Chen · Apex Financial Group',
      reason: 'AI inferred high-urgency compliance need with $100k+ budget signal.',
      actionUrl: '/opportunities/opp-fintech-fraud-02',
      createdAt: '2026-03-22T08:30:00Z'
    };

    const adapted = adaptFounderDecisionItem(raw);
    assert.equal(adapted.id, 'dec-01');
    assert.equal(adapted.type, 'VALIDATION_REQUIRED');
    assert.equal(adapted.title, 'Validate Detected Opportunity');
    assert.equal(adapted.personName, 'David Chen');
    assert.equal(adapted.companyName, 'Apex Financial Group');
    assert.equal(adapted.whyItMatters, 'AI inferred high-urgency compliance need with $100k+ budget signal.');
    assert.equal(adapted.confidence, 92); // HIGH priority
    assert.equal(adapted.primaryActionLabel, 'Review & Validate');
    assert.equal(adapted.actionUrl, '/opportunities/opp-fintech-fraud-02');
  });

  it('handles subtitles without delimiter', () => {
    const raw: BackendDecisionQueueItem = {
      id: 'dec-02',
      type: 'INTRODUCTION_REVIEW',
      priority: 'MEDIUM',
      title: 'Review Intro',
      subtitle: 'Global Logistics Corp'
    };

    const adapted = adaptFounderDecisionItem(raw);
    assert.equal(adapted.type, 'INTRODUCTION_REVIEW_REQUIRED');
    assert.equal(adapted.personName, 'Global Logistics Corp');
    assert.equal(adapted.companyName, 'Target Organization');
    assert.equal(adapted.confidence, 84); // MEDIUM priority
    assert.equal(adapted.primaryActionLabel, 'Review Introduction Draft');
  });

  it('handles null/undefined item gracefully', () => {
    const adapted = adaptFounderDecisionItem(null as any);
    assert.equal(adapted.id, '');
    assert.equal(adapted.type, 'VALIDATION_REQUIRED');
    assert.equal(adapted.personName, 'Key Contact');
  });
});

describe('Founder Decision Adapter: adaptFounderDecisionQueue', () => {
  it('adapts wrapped { queue: [...] } response', () => {
    const raw = {
      queue: [
        { id: '1', title: 'Item 1', subtitle: 'Person 1 · Company 1' },
        { id: '2', title: 'Item 2', subtitle: 'Person 2 · Company 2' }
      ]
    };
    const list = adaptFounderDecisionQueue(raw);
    assert.equal(list.length, 2);
    assert.equal(list[0].id, '1');
    assert.equal(list[1].id, '2');
  });

  it('adapts direct array response', () => {
    const raw = [
      { id: 'direct-1', title: 'Direct Item' }
    ];
    const list = adaptFounderDecisionQueue(raw);
    assert.equal(list.length, 1);
    assert.equal(list[0].id, 'direct-1');
  });

  it('returns empty array on empty or null response', () => {
    assert.deepEqual(adaptFounderDecisionQueue(null), []);
    assert.deepEqual(adaptFounderDecisionQueue(undefined), []);
    assert.deepEqual(adaptFounderDecisionQueue({ queue: [] }), []);
  });
});

describe('founderApi Client Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getDecisions() fetches from /api/v1/cockpit/queue and maps items', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
        queue: [
          {
            id: 'dec-01',
            type: 'OPPORTUNITY_VALIDATION',
            priority: 'HIGH',
            title: 'Validate Detected Opportunity',
            subtitle: 'David Chen · Apex Financial Group',
            reason: 'Urgent compliance need',
            actionUrl: '/opportunities/opp-1'
          }
        ]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const decisions = await founderApi.getDecisions();
    assert.ok(requestedUrl.includes('/api/v1/cockpit/queue'));
    assert.equal(decisions.length, 1);
    assert.equal(decisions[0].id, 'dec-01');
    assert.equal(decisions[0].actionUrl, '/opportunities/opp-1');
  });

  it('getDecisions() falls back to /api/cockpit/queue on 404', async () => {
    let callCount = 0;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      callCount++;
      const url = String(input);
      if (url.includes('/api/v1/cockpit/queue')) {
        return new Response('Not found', { status: 404 });
      }
      if (url.includes('/api/cockpit/queue')) {
        return new Response(JSON.stringify({
          queue: [{ id: 'dec-fallback', title: 'Fallback Item' }]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Not found', { status: 404 });
    };

    const decisions = await founderApi.getDecisions();
    assert.equal(callCount, 2);
    assert.equal(decisions.length, 1);
    assert.equal(decisions[0].id, 'dec-fallback');
  });

  it('getDecisions() propagates 500 error', async () => {
    globalThis.fetch = async () => {
      return new Response('Server Error', { status: 500 });
    };

    await assert.rejects(
      async () => {
        await founderApi.getDecisions();
      },
      (err: any) => {
        assert.equal(err.status, 500);
        return true;
      }
    );
  });
});
