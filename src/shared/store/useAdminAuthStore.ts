import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminAuthState {
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      setAdminToken: (token) => set({ adminToken: token }),
    }),
    { name: "cipe_admin_auth" },
  ),
);
