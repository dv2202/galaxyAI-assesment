import { create } from "zustand";

interface CanvasModeState {
  selectMode: boolean;
  toggleSelectMode: () => void;
}

export const useCanvasModeStore = create<CanvasModeState>((set) => ({
  selectMode: false,
  toggleSelectMode: () => set((s) => ({ selectMode: !s.selectMode })),
}));
