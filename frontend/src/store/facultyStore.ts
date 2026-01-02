import { create } from "zustand";

interface FacultyFormData {
  name: string;
  email: string;
  contact: string;
  courseId: string;
  batchId: string;
  password: string;
  // ---- add your fields here ----
}

interface FacultyStore {
  form: Partial<FacultyFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useFacultyStore = create<FacultyStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
