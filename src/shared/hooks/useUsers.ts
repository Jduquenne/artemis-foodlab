import { useCallback, useEffect, useState } from "react";
import {
  AdminUser,
  CreateUserInput,
  createUser,
  deleteUser,
  listUsers,
  updateUserRole,
} from "../../core/services/usersService";
import { UserRole } from "../../core/services/authService";

export interface UseUsersResult {
  users: AdminUser[];
  loading: boolean;
  loadError: boolean;
  reload: () => void;
  create: (input: CreateUserInput) => Promise<boolean>;
  setRole: (id: string, role: UserRole) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const list = await listUsers();
        if (active) setUsers(list);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [reloadKey]);

  const create = useCallback(async (input: CreateUserInput) => {
    try {
      await createUser(input);
      reload();
      return true;
    } catch {
      return false;
    }
  }, [reload]);

  const setRole = useCallback(async (id: string, role: UserRole) => {
    try {
      const updated = await updateUserRole(id, role);
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return { users, loading, loadError, reload, create, setRole, remove };
}
