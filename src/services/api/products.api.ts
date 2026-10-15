import { apiClient } from './core/client';

export interface ProductItem {
  id: string;
  name: string;
  tagline?: string;
  category?: string;
  description: string;
  features?: string;
  target_audience?: string;
  business_model?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInput {
  name: string;
  tagline?: string;
  category?: string;
  description: string;
  features?: string;
  target_audience?: string;
  business_model?: string;
  status?: string;
}

export const productsApi = {
  list: () => apiClient.get<ProductItem[]>('/api/v1/products'),
  getById: (id: string) => apiClient.get<ProductItem>(`/api/v1/products/${id}`),
  create: (data: ProductInput) => apiClient.post<ProductItem>('/api/v1/products', data),
  update: (id: string, data: Partial<ProductInput>) => apiClient.put<ProductItem>(`/api/v1/products/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean; deleted_id: string }>(`/api/v1/products/${id}`)
};
