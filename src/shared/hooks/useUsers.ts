import { useCallback, useEffect, useState } from "react";
import { createUser, deleteUser, listUsers, updateUserRole } from "../../core/services/usersService";
import { AdminUser, CreateUserInput, UserRole } from "../../core/domain/user";

export interface UseUsersResult {
  users: AdminUser[];
  loading: boolean;
  loadError: boolean;
  reload: () => void;
  create: (input: CreateUserInput) => Promise<boolean>;
  setRole: (id: string, role: UserRole) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

interface UsersLoad {
  key: number;
  users: AdminUser[];
  error: boolean;
}

export function useUsers(): UseUsersResult {
  const [reloadKey, setReloadKey] = useState(0);
  const [load, setLoad] = useState<UsersLoad | null>(null);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    listUsers()
      .then((users) => {
        if (active) setLoad({ key: reloadKey, users, error: false });
      })
      .catch(() => {
        if (active) setLoad((prev) => ({ key: reloadKey, users: prev?.users ?? [], error: true }));
      });
    return () => { active = false; };
  }, [reloadKey]);

  const updateUsers = (update: (users: AdminUser[]) => AdminUser[]) =>
    setLoad((prev) => (prev ? { ...prev, users: update(prev.users) } : prev));

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
      updateUsers((users) => users.map((user) => (user.id === id ? updated : user)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      updateUsers((users) => users.filter((user) => user.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const retrying = load !== null && load.error && load.key !== reloadKey;

  return {
    users: load?.users ?? [],
    loading: load === null || retrying,
    loadError: load !== null && load.error && !retrying,
    reload,
    create,
    setRole,
    remove,
  };
}
