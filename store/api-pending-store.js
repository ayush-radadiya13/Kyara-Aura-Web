import { create } from "zustand";

export const useApiPendingStore = create((set, get) => ({
  pendingCount: 0,
  increment: () => set({ pendingCount: get().pendingCount + 1 }),
  decrement: () =>
    set({ pendingCount: Math.max(0, get().pendingCount - 1) }),
}));
