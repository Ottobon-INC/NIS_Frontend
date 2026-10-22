export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Resolves authorization headers for NetworkOS API requests.
 * 
 * DEVELOPMENT NOTE:
 * The current backend FastAPI `dependencies.py` accepts:
 * `authorization in ["Bearer mock-token", "Bearer mock-admin-token"]`.
 * 
 * PRODUCTION PREREQUISITE:
 * Real production deployment requires integrating a standard JWT/OAuth 2.0 provider
 * (such as Supabase Auth or corporate IdP), populating runtime tokens via `setAuthToken(jwt)`.
 * Mock tokens are used strictly for local development and are NOT production security.
 */
let inMemoryToken: string | null = null;

export const getAuthToken = (): string => {
  if (inMemoryToken) {
    return inMemoryToken.startsWith('Bearer ') ? inMemoryToken : `Bearer ${inMemoryToken}`;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem('networkos_auth_token');
      if (stored) {
        return stored.startsWith('Bearer ') ? stored : `Bearer ${stored}`;
      }
    } catch {
      // ignore storage access errors
    }
  }
  const envToken = import.meta.env?.VITE_AUTH_TOKEN;
  if (envToken) {
    return envToken.startsWith('Bearer ') ? envToken : `Bearer ${envToken}`;
  }

  // Strictly enforce that mock-admin-token is development/testing only
  const isProduction = import.meta.env?.PROD === true || import.meta.env?.MODE === 'production';
  if (isProduction) {
    return '';
  }

  return 'Bearer mock-admin-token';
};

export const setAuthToken = (token: string | null): void => {
  inMemoryToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (token) {
        window.localStorage.setItem('networkos_auth_token', token);
      } else {
        window.localStorage.removeItem('networkos_auth_token');
      }
    } catch {
      // ignore
    }
  }
};

const getBaseUrl = (): string => {
  return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorData: any = null;
    try {
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
        if (typeof errorData?.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (errorData?.detail?.message) {
          errorDetail = errorData.detail.message;
        } else if (errorData?.error?.message) {
          errorDetail = errorData.error.message;
        } else if (text) {
          errorDetail = text;
        }
      } catch {
        if (text) errorDetail = text;
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errorDetail, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
};

const buildHeaders = (customHeaders?: HeadersInit, contentType?: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = token;
  }
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => { headers[key] = value; });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => { headers[key] = value; });
    } else {
      Object.assign(headers, customHeaders);
    }
  }
  return headers;
};

export const apiClient = {
  async get<T>(endpoint: string, customHeaders?: HeadersInit): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      headers: buildHeaders(customHeaders)
    });
    return handleResponse<T>(response);
  },
  
  async post<T>(endpoint: string, body: any, customHeaders?: HeadersInit): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(customHeaders, 'application/json'),
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, body: any, customHeaders?: HeadersInit): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'PATCH',
      headers: buildHeaders(customHeaders, 'application/json'),
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, body: any, customHeaders?: HeadersInit): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(customHeaders, 'application/json'),
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, customHeaders?: HeadersInit): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(customHeaders)
    });
    return handleResponse<T>(response);
  }
};
