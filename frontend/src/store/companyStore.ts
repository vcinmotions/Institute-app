import { create } from "zustand";

interface CompanyFormData {
  name: string;
  instituteName: string;
  email: string;
  password: string;
  contact: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  // ---- add your fields here ----
}

interface CompanyStore {
  form: Partial<CompanyFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useComapnyStore = create<CompanyStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
