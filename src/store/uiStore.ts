import { create } from 'zustand';

export interface EvidenceState {
  isOpen: boolean;
  evidenceId: string | null;
  type: 'FACT' | 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED' | string | null;
  contentTitle?: string;
  contactId?: string | null;
}

interface UIStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  evidenceDrawer: EvidenceState;
  openEvidenceDrawer: (id: string, type: EvidenceState['type'], title?: string, contactId?: string) => void;
  closeEvidenceDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  evidenceDrawer: {
    isOpen: false,
    evidenceId: null,
    type: null,
    contentTitle: undefined,
    contactId: null,
  },
  openEvidenceDrawer: (id, type, title, contactId) => set({
    evidenceDrawer: { isOpen: true, evidenceId: id, type, contentTitle: title, contactId: contactId || null }
  }),
  closeEvidenceDrawer: () => set((state) => ({
    evidenceDrawer: { ...state.evidenceDrawer, isOpen: false }
  })),
}));
