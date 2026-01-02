import { create } from "zustand";

interface RoleFormData {
  name: string;
  course: string;
  email: string;
  source: string;
  contact: string;
  // ---- add your fields here ----
}

interface RoleStore {
  form: Partial<RoleFormData>;
  setField: (field: string, value: any) => void;
  reset: () => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  form: {},

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  reset: () => set({ form: {} }),
}));
