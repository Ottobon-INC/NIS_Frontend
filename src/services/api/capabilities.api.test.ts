import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptBackendKnowledgeItem,
  adaptCapabilitiesResponse,
  capabilitiesApi,
  type BackendKnowledgeItem
} from './capabilities.api.ts';

describe('Capabilities Adapter: adaptBackendKnowledgeItem', () => {
  it('should map name correctly when present', () => {
    const item: BackendKnowledgeItem = {
      id: 'cap-1',
      name: 'Custom Capability',
      description: 'A test capability',
      category: 'ENGINEERING'
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.equal(adapted.id, 'cap-1');
    assert.equal(adapted.name, 'Custom Capability');
    assert.equal(adapted.category, 'ENGINEERING');
    assert.equal(adapted.description, 'A test capability');
  });

  it('should resolve title when name is absent', () => {
    const item: BackendKnowledgeItem = {
      id: 'prod-1',
      title: 'Product Title',
      description: 'A test product'
    };
    const adapted = adaptBackendKnowledgeItem(item, 'PRODUCT');
    assert.equal(adapted.id, 'prod-1');
    assert.equal(adapted.name, 'Product Title');
    assert.equal(adapted.category, 'PRODUCT');
  });

  it('should fallback to Untitled Offering when both name and title are absent', () => {
    const item: BackendKnowledgeItem = {
      id: 'unknown-1'
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.equal(adapted.name, 'Untitled Offering');
  });

  it('should parse stringified JSON array features into relevantExpertise', () => {
    const item: BackendKnowledgeItem = {
      id: 'prod-json',
      title: 'SBloom Platform',
      features: JSON.stringify(['AI Matching', 'Real-time Alerts', 'Export PDF'])
    };
    const adapted = adaptBackendKnowledgeItem(item, 'PRODUCT');
    assert.deepEqual(adapted.relevantExpertise, ['AI Matching', 'Real-time Alerts', 'Export PDF']);
  });

  it('should handle comma-separated string features', () => {
    const item: BackendKnowledgeItem = {
      id: 'prod-csv',
      name: 'Integration Suite',
      features: 'REST API, Webhooks, GraphQL'
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.deepEqual(adapted.relevantExpertise, ['REST API', 'Webhooks', 'GraphQL']);
  });

  it('should use existing array features if already an array', () => {
    const item: BackendKnowledgeItem = {
      id: 'prod-arr',
      name: 'Cloud Infrastructure',
      features: ['Kubernetes', 'Terraform']
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.deepEqual(adapted.relevantExpertise, ['Kubernetes', 'Terraform']);
  });

  it('should prioritize relevantExpertise if explicitly provided', () => {
    const item: BackendKnowledgeItem = {
      id: 'cap-exp',
      name: 'Data Engineering',
      features: ['Old Feature'],
      relevantExpertise: ['Spark', 'Kafka']
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.deepEqual(adapted.relevantExpertise, ['Spark', 'Kafka']);
  });

  it('should fallback to tagline if features and relevantExpertise are absent', () => {
    const item: BackendKnowledgeItem = {
      id: 'prod-tag',
      name: 'Marketing Engine',
      tagline: 'Empower your sales team'
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.deepEqual(adapted.relevantExpertise, ['Empower your sales team']);
  });

  it('should resolve evidenceSource from sources array if evidenceSource is not set', () => {
    const item: BackendKnowledgeItem = {
      id: 'cap-src',
      name: 'Security Audit',
      sources: ['ISO-27001 Certification', 'Annual Report']
    };
    const adapted = adaptBackendKnowledgeItem(item);
    assert.equal(adapted.evidenceSource, 'ISO-27001 Certification');
  });

  it('should provide default catalog name as evidenceSource when no source is available', () => {
    const capItem: BackendKnowledgeItem = { id: 'cap-none', name: 'Cap' };
    const prodItem: BackendKnowledgeItem = { id: 'prod-none', name: 'Prod', category: 'PRODUCT' };
    
    const adaptedCap = adaptBackendKnowledgeItem(capItem, 'CAPABILITY');
    const adaptedProd = adaptBackendKnowledgeItem(prodItem, 'PRODUCT');
    
    assert.equal(adaptedCap.evidenceSource, 'Internal Capabilities Catalog');
    assert.equal(adaptedProd.evidenceSource, 'Internal Products Catalog');
  });

  it('should gracefully handle null or undefined item', () => {
    const adapted = adaptBackendKnowledgeItem(null as any);
    assert.equal(adapted.id, '');
    assert.equal(adapted.name, 'Untitled Offering');
    assert.deepEqual(adapted.relevantExpertise, []);
  });
});

describe('Capabilities Adapter: adaptCapabilitiesResponse', () => {
  it('should adapt direct array responses', () => {
    const raw: BackendKnowledgeItem[] = [
      { id: '1', name: 'Cap 1', category: 'AI' },
      { id: '2', title: 'Prod 2', category: 'PRODUCT' }
    ];
    const result = adaptCapabilitiesResponse(raw);
    assert.equal(result.capabilities.length, 2);
    assert.equal(result.capabilities[0].name, 'Cap 1');
    assert.equal(result.capabilities[1].name, 'Prod 2');
  });

  it('should adapt object responses wrapped in { capabilities: [...] }', () => {
    const raw = {
      capabilities: [
        { id: 'c1', name: 'Capability Alpha' }
      ]
    };
    const result = adaptCapabilitiesResponse(raw);
    assert.equal(result.capabilities.length, 1);
    assert.equal(result.capabilities[0].name, 'Capability Alpha');
  });

  it('should adapt object responses wrapped in { products: [...] }', () => {
    const raw = {
      products: [
        { id: 'p1', title: 'Product Beta' }
      ]
    };
    const result = adaptCapabilitiesResponse(raw, 'PRODUCT');
    assert.equal(result.capabilities.length, 1);
    assert.equal(result.capabilities[0].name, 'Product Beta');
    assert.equal(result.capabilities[0].category, 'PRODUCT');
  });

  it('should adapt object responses wrapped in { items: [...] }', () => {
    const raw = {
      items: [
        { id: 'i1', name: 'Item Gamma' }
      ]
    };
    const result = adaptCapabilitiesResponse(raw);
    assert.equal(result.capabilities.length, 1);
    assert.equal(result.capabilities[0].name, 'Item Gamma');
  });

  it('should return empty capabilities array for empty array', () => {
    const result = adaptCapabilitiesResponse([]);
    assert.deepEqual(result.capabilities, []);
  });

  it('should return empty capabilities array for null or undefined', () => {
    assert.deepEqual(adaptCapabilitiesResponse(null).capabilities, []);
    assert.deepEqual(adaptCapabilitiesResponse(undefined).capabilities, []);
  });
});

describe('capabilitiesApi Client Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('list() should fetch both capabilities and products and merge them', async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/knowledge/capabilities/')) {
        return new Response(JSON.stringify([
          { id: 'cap-1', name: 'Cloud Integration', category: 'CLOUD' }
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/api/v1/knowledge/products/')) {
        return new Response(JSON.stringify([
          { id: 'prod-1', title: 'NIS Platform', features: '["Feature A"]' }
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Not found', { status: 404 });
    };

    const result = await capabilitiesApi.list();
    assert.equal(result.capabilities.length, 2);
    assert.equal(result.capabilities[0].id, 'cap-1');
    assert.equal(result.capabilities[0].name, 'Cloud Integration');
    assert.equal(result.capabilities[1].id, 'prod-1');
    assert.equal(result.capabilities[1].name, 'NIS Platform');
    assert.equal(result.capabilities[1].category, 'PRODUCT');
    assert.deepEqual(result.capabilities[1].relevantExpertise, ['Feature A']);
  });

  it('list() should handle empty results from both endpoints', async () => {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const result = await capabilitiesApi.list();
    assert.deepEqual(result.capabilities, []);
  });

  it('list() should tolerate partial failures (e.g. products fails, capabilities succeeds)', async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/knowledge/capabilities/')) {
        return new Response(JSON.stringify([
          { id: 'cap-1', name: 'Robust Service' }
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Internal Server Error', { status: 500 });
    };

    const result = await capabilitiesApi.list();
    assert.equal(result.capabilities.length, 1);
    assert.equal(result.capabilities[0].id, 'cap-1');
  });

  it('list() should throw if both endpoints fail', async () => {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ detail: 'Service Unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    await assert.rejects(
      async () => {
        await capabilitiesApi.list();
      },
      (err: any) => {
        assert.equal(err.status, 503);
        return true;
      }
    );
  });

  it('listCapabilities() should fetch only from capabilities endpoint', async () => {
    let calledUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      calledUrl = String(input);
      return new Response(JSON.stringify([
        { id: 'cap-only', name: 'Solo Capability' }
      ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const res = await capabilitiesApi.listCapabilities();
    assert.ok(calledUrl.includes('/api/v1/knowledge/capabilities/'));
    assert.equal(res.capabilities.length, 1);
    assert.equal(res.capabilities[0].id, 'cap-only');
  });

  it('listProducts() should fetch only from products endpoint', async () => {
    let calledUrl = '';
    globalThis.fetch = async (input: RequestInfo | URL) => {
      calledUrl = String(input);
      return new Response(JSON.stringify([
        { id: 'prod-only', title: 'Solo Product' }
      ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const res = await capabilitiesApi.listProducts();
    assert.ok(calledUrl.includes('/api/v1/knowledge/products/'));
    assert.equal(res.capabilities.length, 1);
    assert.equal(res.capabilities[0].id, 'prod-only');
    assert.equal(res.capabilities[0].category, 'PRODUCT');
  });

  it('getById() should return capability when found on capabilities endpoint', async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/knowledge/capabilities/cap-123')) {
        return new Response(JSON.stringify({
          id: 'cap-123',
          name: 'Target Capability'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Not found', { status: 404 });
    };

    const item = await capabilitiesApi.getById('cap-123');
    assert.equal(item.id, 'cap-123');
    assert.equal(item.name, 'Target Capability');
  });

  it('getById() should fallback to products endpoint if capabilities endpoint returns 404', async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/knowledge/capabilities/prod-456')) {
        return new Response('Not found', { status: 404 });
      }
      if (url.includes('/api/v1/knowledge/products/prod-456')) {
        return new Response(JSON.stringify({
          id: 'prod-456',
          title: 'Target Product'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Not found', { status: 404 });
    };

    const item = await capabilitiesApi.getById('prod-456');
    assert.equal(item.id, 'prod-456');
    assert.equal(item.name, 'Target Product');
    assert.equal(item.category, 'PRODUCT');
  });

  it('getById() should propagate 500 error without fallback', async () => {
    globalThis.fetch = async () => {
      return new Response('Internal Server Error', { status: 500 });
    };

    await assert.rejects(
      async () => {
        await capabilitiesApi.getById('err-item');
      },
      (err: any) => {
        assert.equal(err.status, 500);
        return true;
      }
    );
  });
});
