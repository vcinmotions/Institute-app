import { create } from "zustand";

interface CourseFormData {
  name: string;
  description: string;
  durationWeeks: string;
  paymentType: string;
  totalAmount: string;
  installmentCount: string;
  // ---- add your fields here ----
}

interface CourseStore {
  form: Partial<CourseFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
