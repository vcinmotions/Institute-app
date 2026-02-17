import { create } from "zustand";

interface StationaryFormData {
  name: string;
  totalQuantity: string;
  // ---- add your fields here ----
}

interface StationaryStore {
  form: Partial<StationaryFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useStationaryStore = create<StationaryStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
