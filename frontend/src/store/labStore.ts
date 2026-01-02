import { create } from "zustand";

interface LabFormData {
  name: string;
  location: string;
  totalPCs: number;
  timeSlots: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

interface LabStore {
  form: Partial<LabFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useLabStore = create<LabStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
