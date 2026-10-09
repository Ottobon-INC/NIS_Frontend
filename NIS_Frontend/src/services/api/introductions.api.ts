import { apiClient } from './core/client';

export interface IntroDraft {
  id: string;
  matchId: string;
  recipientName: string;
  subject: string;
  body: string;
  status: 'DRAFT' | 'APPROVED_TO_SEND';
}

export const introductionsApi = {
  getDraft: (id: string) => apiClient.get<IntroDraft>(`/api/messages/drafts/${id}`),

  approveDraft: async (id: string, updatedBody: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/messages/approve/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: updatedBody })
    });
    if (!response.ok) throw new Error('Failed to approve message');
    return response.json();
  }
};
