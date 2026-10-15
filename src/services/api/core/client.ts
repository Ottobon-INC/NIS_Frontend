export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    
    return response.json();
  },
  
  async post<T>(endpoint: string, body: any): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-admin-token'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-admin-token'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  },

  async patch<T>(endpoint: string, body: any): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-admin-token'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': 'Bearer mock-admin-token'
      }
    });
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  }
};
