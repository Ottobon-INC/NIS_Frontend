import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptMeetingFinding,
  adaptMeetingIntelligence,
  meetingIntelligenceApi,
  type BackendMeetingFinding
} from './meetingIntelligence.api.ts';

describe('Meeting Intelligence Adapter: adaptMeetingFinding', () => {
  it('maps backend finding with claim, evidenceQuote, and trustLevel', () => {
    const raw: BackendMeetingFinding = {
      id: 'f-1',
      type: 'PROBLEM',
      claim: 'Legacy regression',
      evidenceQuote: 'We have 200 custom programs',
      trustLevel: 'INFERENCE'
    };

    const adapted = adaptMeetingFinding(raw, 'm-1');
    assert.equal(adapted.id, 'f-1');
    assert.equal(adapted.type, 'PROBLEM');
    assert.equal(adapted.content, 'Legacy regression');
    assert.equal(adapted.evidence, 'We have 200 custom programs');
    assert.equal(adapted.confidence, 82);
    assert.equal(adapted.status, 'AWAITING_VALIDATION');
    assert.equal(adapted.sourceMeetingId, 'm-1');
  });

  it('maps CONFIRMED trustLevel to 95 confidence and CONFIRMED status', () => {
    const raw: BackendMeetingFinding = {
      id: 'f-2',
      type: 'REQUIREMENT',
      claim: 'On-premise only',
      evidenceQuote: 'Data privacy policy',
      trustLevel: 'CONFIRMED'
    };

    const adapted = adaptMeetingFinding(raw, 'm-1');
    assert.equal(adapted.type, 'REQUIREMENT');
    assert.equal(adapted.confidence, 95);
    assert.equal(adapted.status, 'CONFIRMED');
  });

  it('handles null finding gracefully', () => {
    const adapted = adaptMeetingFinding(null as any, 'm-default');
    assert.equal(adapted.id, '');
    assert.equal(adapted.sourceMeetingId, 'm-default');
  });
});

describe('Meeting Intelligence Adapter: adaptMeetingIntelligence', () => {
  it('maps backend response containing array of findings', () => {
    const raw = {
      meetingId: 'meet-999',
      findings: [
        { id: 'f-1', claim: 'Problem 1' },
        { id: 'f-2', claim: 'Problem 2' }
      ]
    };

    const adapted = adaptMeetingIntelligence(raw, 'meet-999');
    assert.equal(adapted.meetingId, 'meet-999');
    assert.equal(adapted.findings.length, 2);
    assert.equal(adapted.findings[0].content, 'Problem 1');
  });

  it('handles null/undefined response', () => {
    const adapted = adaptMeetingIntelligence(null, 'meet-empty');
    assert.equal(adapted.meetingId, 'meet-empty');
    assert.deepEqual(adapted.findings, []);
  });
});

describe('meetingIntelligenceApi Client Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getFindings() fetches from /api/v1/meetings/:id/intelligence', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
        meetingId: 'meet-100',
        findings: [{ id: 'f1', claim: 'Claim 1' }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const res = await meetingIntelligenceApi.getFindings('meet-100');
    assert.ok(requestedUrl.includes('/api/v1/meetings/meet-100/intelligence'));
    assert.equal(res.meetingId, 'meet-100');
    assert.equal(res.findings.length, 1);
  });

  it('validateFinding() patches to /api/v1/meetings/:meetingId/intelligence/:findingId', async () => {
    let patchedUrl = '';
    let patchedBody = '';
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      patchedUrl = String(input);
      patchedBody = String(init?.body || '');
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const res = await meetingIntelligenceApi.validateFinding('m1', 'f1', 'CONFIRMED', 'New content');
    assert.ok(patchedUrl.includes('/api/v1/meetings/m1/intelligence/f1'));
    assert.ok(patchedBody.includes('CONFIRMED'));
    assert.equal(res.success, true);
  });
});
