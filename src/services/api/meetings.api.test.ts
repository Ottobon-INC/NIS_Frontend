import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptMeetingBrief,
  meetingsApi,
  type BackendMeetingBrief
} from './meetings.api.ts';

describe('Meeting Brief Adapter: adaptMeetingBrief', () => {
  it('correctly adapts backend response with single objective and nested relationshipContext', () => {
    const raw: BackendMeetingBrief = {
      meetingId: 'meet-123',
      contactName: 'Rahul Dhamdhere',
      title: 'VP Engineering & Enterprise Architecture',
      company: 'Global Logistics Corp',
      meetingDate: '2026-03-24T15:00:00Z',
      objective: 'Explore autonomous ABAP migration pilot for Q3 deliverables.',
      talkingPoints: [
        'Acknowledge recent public modernization milestone at Global Logistics.',
        'Address specific technical bottleneck around custom SAP ECC table dependencies.'
      ],
      relationshipContext: {
        strength: 4,
        connectedVia: 'Bhanu (Alumni / Professional)',
        lastInteraction: 'SAP Summit 2024'
      }
    };

    const adapted = adaptMeetingBrief(raw);
    assert.equal(adapted.id, 'meet-123');
    assert.equal(adapted.contactName, 'Rahul Dhamdhere');
    assert.equal(adapted.company, 'Global Logistics Corp');
    assert.deepEqual(adapted.objectives, ['Explore autonomous ABAP migration pilot for Q3 deliverables.']);
    assert.equal(adapted.suggestedTopics.length, 2);
    assert.equal(adapted.suggestedTopics[0], 'Acknowledge recent public modernization milestone at Global Logistics.');
    assert.ok(Array.isArray(adapted.recentSignals));
    // Relationship context must be a string so React never crashes on {object} child
    assert.equal(typeof adapted.relationshipContext, 'string');
    assert.ok(adapted.relationshipContext.includes('Connected via Bhanu (Alumni / Professional)'));
    assert.ok(adapted.relationshipContext.includes('Last interaction: SAP Summit 2024'));
    assert.ok(adapted.relationshipContext.includes('Relationship strength: 4/5'));
  });

  it('handles existing string relationshipContext', () => {
    const raw: BackendMeetingBrief = {
      id: 'm1',
      relationshipContext: 'Met at SaaStr 2025'
    };
    const adapted = adaptMeetingBrief(raw);
    assert.equal(adapted.relationshipContext, 'Met at SaaStr 2025');
  });

  it('handles null/undefined gracefully', () => {
    const adapted = adaptMeetingBrief(null);
    assert.equal(adapted.id, '');
    assert.equal(adapted.contactName, 'Meeting Participant');
    assert.deepEqual(adapted.objectives, []);
    assert.deepEqual(adapted.suggestedTopics, []);
    assert.deepEqual(adapted.recentSignals, []);
    assert.equal(adapted.relationshipContext, 'No prior interactions recorded.');
  });
});

describe('meetingsApi Client Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getBrief() fetches from /api/v1/meetings/:id/brief', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
        meetingId: 'meet-test',
        contactName: 'Alice',
        company: 'Wonderland',
        objective: 'Test objective'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const brief = await meetingsApi.getBrief('meet-test');
    assert.ok(requestedUrl.includes('/api/v1/meetings/meet-test/brief'));
    assert.equal(brief.id, 'meet-test');
    assert.equal(brief.contactName, 'Alice');
  });

  it('capture() posts to /api/v1/meetings/:id/capture and returns jobId', async () => {
    let capturedUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      capturedUrl = String(input);
      return new Response(JSON.stringify({
        meetingId: 'meet-cap-1',
        status: 'PROCESSING'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const res = await meetingsApi.capture('meet-cap-1', { transcript: 'Discussion about microservices' });
    assert.ok(capturedUrl.includes('/api/v1/meetings/meet-cap-1/capture'));
    assert.equal(res.jobId, 'meet-cap-1');
  });

  it('getCaptureStatus() resolves status when intelligence findings exist', async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/meetings/jobs/job-1/status')) {
        return new Response('Not found', { status: 404 });
      }
      if (url.includes('/api/v1/meetings/job-1/intelligence')) {
        return new Response(JSON.stringify({
          meetingId: 'job-1',
          findings: [{ id: 'f1', claim: 'Problem detected' }]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Not found', { status: 404 });
    };

    const status = await meetingsApi.getCaptureStatus('job-1');
    assert.equal(status.id, 'job-1');
    assert.equal(status.status, 'EXTRACTED');
    assert.ok(status.opportunityId);
  });
});
