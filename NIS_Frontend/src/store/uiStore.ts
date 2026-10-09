import { create } from 'zustand';

interface EvidenceState {
  isOpen: boolean;
  evidenceId: string | null;
  type: 'FACT' | 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED' | null;
  contentTitle?: string;
}

interface UIStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  evidenceDrawer: EvidenceState;
  openEvidenceDrawer: (id: string, type: EvidenceState['type'], title?: string) => void;
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
  },
  openEvidenceDrawer: (id, type, title) => set({
    evidenceDrawer: { isOpen: true, evidenceId: id, type, contentTitle: title }
  }),
  closeEvidenceDrawer: () => set((state) => ({
    evidenceDrawer: { ...state.evidenceDrawer, isOpen: false }
  })),
}));
