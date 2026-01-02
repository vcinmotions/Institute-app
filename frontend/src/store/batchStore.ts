import { create } from "zustand";

interface BatchFormData {
  name: string;
  selectedLab: number | null;
  selectedTimeSlot: number | null;
  selectedFaculty: number | null;
}

interface BatchStore {
  form: Partial<BatchFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useBatchStore = create<BatchStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
