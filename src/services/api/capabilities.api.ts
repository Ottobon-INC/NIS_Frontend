import { apiClient } from './core/client.ts';

export type CapabilityCategory = 'PRODUCT' | 'SERVICE' | 'EXPERTISE' | 'SOLUTION' | string;
export type MatchAlignment = 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
export type CapabilityMatchStatus = 'CANDIDATE' | 'SELECTED' | 'REJECTED';

export interface Capability {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  relevantExpertise: string[];
  evidenceSource: string;
}

export interface CapabilityMatch {
  id: string;
  opportunityId: string;
  capabilityId: string;
  capability: Capability;
  status: CapabilityMatchStatus;
  reasoning: {
    problemAlignment: MatchAlignment;
    requirementAlignment: MatchAlignment;
    technologyAlignment: MatchAlignment;
    industryAlignment: MatchAlignment;
    overallExplanation: string;
  };
  evidenceIds: string[]; // typically referencing trusted context
  confidence: number;
}

/**
 * Raw data shape returned by backend company knowledge endpoints:
 * - GET /api/v1/knowledge/capabilities/
 * - GET /api/v1/knowledge/products/
 * - GET /api/v1/knowledge/services/
 */
export interface BackendKnowledgeItem {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  tagline?: string | null;
  features?: string | string[] | null;
  target_audience?: string | null;
  business_model?: string | null;
  status?: string | null;
  sources?: string[] | null;
  relevantExpertise?: string[] | null;
  evidenceSource?: string | null;
}

export type BackendKnowledgeResponse =
  | BackendKnowledgeItem[]
  | { capabilities?: BackendKnowledgeItem[] }
  | { products?: BackendKnowledgeItem[] }
  | { items?: BackendKnowledgeItem[] }
  | null
  | undefined;

/**
 * Typed adapter converting raw backend item into frontend Capability model.
 * Resolves title vs name, stringified JSON features vs array, category, and evidenceSource.
 */
export function adaptBackendKnowledgeItem(
  item: BackendKnowledgeItem,
  defaultCategory: CapabilityCategory = 'CAPABILITY'
): Capability {
  if (!item) {
    return {
      id: '',
      name: 'Untitled Offering',
      category: defaultCategory,
      description: '',
      relevantExpertise: [],
      evidenceSource: 'Internal Knowledge Base'
    };
  }

  // 1. Resolve title vs name
  const resolvedName = (item.name || item.title || 'Untitled Offering').trim();

  // 2. Resolve Category
  let resolvedCategory: CapabilityCategory = defaultCategory;
  if (item.category && item.category.trim()) {
    resolvedCategory = item.category.trim();
  }

  // 3. Resolve Description
  const resolvedDescription = (item.description || item.tagline || '').trim();

  // 4. Resolve Relevant Expertise / Features
  let resolvedExpertise: string[] = [];
  if (Array.isArray(item.relevantExpertise) && item.relevantExpertise.length > 0) {
    resolvedExpertise = item.relevantExpertise.map(e => String(e).trim()).filter(Boolean);
  } else if (Array.isArray(item.features) && item.features.length > 0) {
    resolvedExpertise = item.features.map(f => String(f).trim()).filter(Boolean);
  } else if (typeof item.features === 'string' && item.features.trim()) {
    try {
      const parsed = JSON.parse(item.features);
      if (Array.isArray(parsed)) {
        resolvedExpertise = parsed.map(f => String(f).trim()).filter(Boolean);
      } else {
        resolvedExpertise = [item.features.trim()];
      }
    } catch {
      resolvedExpertise = item.features.split(',').map(s => s.trim()).filter(Boolean);
    }
  } else if (item.tagline) {
    resolvedExpertise = [item.tagline.trim()];
  }

  // 5. Resolve Evidence Source
  const resolvedSource = (
    item.evidenceSource ||
    (item.sources && item.sources.length > 0 ? item.sources[0] : null) ||
    (resolvedCategory.toUpperCase().includes('PRODUCT') ? 'Internal Products Catalog' : 'Internal Capabilities Catalog')
  );

  return {
    id: item.id || '',
    name: resolvedName,
    category: resolvedCategory,
    description: resolvedDescription,
    relevantExpertise: resolvedExpertise,
    evidenceSource: resolvedSource
  };
}

/**
 * Typed adapter normalizing both direct array and wrapped object responses into { capabilities: Capability[] }.
 */
export function adaptCapabilitiesResponse(
  raw: BackendKnowledgeResponse,
  defaultCategory: CapabilityCategory = 'CAPABILITY'
): { capabilities: Capability[] } {
  if (!raw) {
    return { capabilities: [] };
  }

  let list: BackendKnowledgeItem[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray((raw as any).capabilities)) {
    list = (raw as any).capabilities;
  } else if (Array.isArray((raw as any).products)) {
    list = (raw as any).products;
  } else if (Array.isArray((raw as any).items)) {
    list = (raw as any).items;
  }

  return {
    capabilities: list.map(item => adaptBackendKnowledgeItem(item, defaultCategory))
  };
}

export const capabilitiesApi = {
  /**
   * Fetches internal capabilities from the real backend.
   * Endpoint: /api/v1/knowledge/capabilities/
   */
  listCapabilities: async (): Promise<{ capabilities: Capability[] }> => {
    const res = await apiClient.get<BackendKnowledgeResponse>('/api/v1/knowledge/capabilities/');
    return adaptCapabilitiesResponse(res, 'CAPABILITY');
  },

  /**
   * Fetches internal products from the real backend.
   * Endpoint: /api/v1/knowledge/products/
   */
  listProducts: async (): Promise<{ capabilities: Capability[] }> => {
    const res = await apiClient.get<BackendKnowledgeResponse>('/api/v1/knowledge/products/');
    return adaptCapabilitiesResponse(res, 'PRODUCT');
  },

  /**
   * Unified catalog list method connecting to the real backend.
   * Aggregates both capabilities and products from /api/v1/knowledge/
   * while preserving the exact existing frontend contract: { capabilities: Capability[] }.
   */
  list: async (): Promise<{ capabilities: Capability[] }> => {
    const [capsResult, prodsResult] = await Promise.allSettled([
      apiClient.get<BackendKnowledgeResponse>('/api/v1/knowledge/capabilities/'),
      apiClient.get<BackendKnowledgeResponse>('/api/v1/knowledge/products/')
    ]);

    // If both rejected, propagate the primary API error
    if (capsResult.status === 'rejected' && prodsResult.status === 'rejected') {
      throw capsResult.reason;
    }

    const caps = capsResult.status === 'fulfilled'
      ? adaptCapabilitiesResponse(capsResult.value, 'CAPABILITY').capabilities
      : [];

    const prods = prodsResult.status === 'fulfilled'
      ? adaptCapabilitiesResponse(prodsResult.value, 'PRODUCT').capabilities
      : [];

    return {
      capabilities: [...caps, ...prods]
    };
  },

  /**
   * Fetches single capability or product by ID.
   */
  getById: async (id: string): Promise<Capability> => {
    try {
      const item = await apiClient.get<BackendKnowledgeItem>(`/api/v1/knowledge/capabilities/${id}`);
      return adaptBackendKnowledgeItem(item, 'CAPABILITY');
    } catch (err: any) {
      if (err?.status === 404) {
        const productItem = await apiClient.get<BackendKnowledgeItem>(`/api/v1/knowledge/products/${id}`);
        return adaptBackendKnowledgeItem(productItem, 'PRODUCT');
      }
      throw err;
    }
  }
};

export const capabilityMatchingApi = {
  getMatches: (opportunityId: string) =>
    apiClient.get<{ matches: CapabilityMatch[] }>(`/api/opportunities/${opportunityId}/capability-matches`),
  updateMatchStatus: (opportunityId: string, matchId: string, status: CapabilityMatchStatus) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/capability-matches/${matchId}`, { status })
};
