import { create } from "zustand";

interface EnquiryFormData {
  name: string;
  courseId: string[];
  email: string;
  source: string;
  contact: string;
  alternateContact: string,
  age: string,
  location: string,
  gender: string,
  dob: string,
  referedBy: string,
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
