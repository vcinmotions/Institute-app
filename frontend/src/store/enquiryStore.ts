import { create } from "zustand";

interface EnquiryFormData {
  name: string;
  course: string;
  email: string;
  source: string;
  contact: string;
  // ---- add your fields here ----
}

interface EnquiryStore {
  form: Partial<EnquiryFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useEnquiryStore = create<EnquiryStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
