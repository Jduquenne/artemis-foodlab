import { useState } from "react";
import { Plus, RotateCw, Users } from "lucide-react";
import { useUsers } from "../../../../shared/hooks/useUsers";
import { useAuthStore } from "../../../../shared/store/useAuthStore";
import { AdminUser } from "../../../../core/services/usersService";
import { UserRole } from "../../../../core/services/authService";
import { ROLE_LABELS, buildRoleChangeRecap } from "../../../../core/logic/dashboard/userFormLogic";
import { UserRow } from "./UserRow";
import { UserFormModal } from "./UserFormModal";
import { ConfirmActionModal } from "../data/ConfirmActionModal";

export const UsersPanel = () => {
  const { users, loading, loadError, reload, create, setRole, remove } = useUsers();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [creating, setCreating] = useState(false);
  const [pendingRole, setPendingRole] = useState<{ user: AdminUser; role: UserRole } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <h2 className="flex-1 text-sm font-bold text-slate-500">
          Utilisateurs <span className="text-slate-400">· {users.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </header>

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-slate-500">Impossible de charger les comptes.</p>
          <button
            type="button"
            onClick={reload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors"
          >
            <RotateCw size={13} />
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-400">Chargement…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
          <Users size={28} />
          <p className="text-sm">Aucun compte pour l'instant.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              isLastAdmin={user.role === "admin" && adminCount === 1}
              onAskRole={(target, role) => setPendingRole({ user: target, role })}
              onAskDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {creating && <UserFormModal onClose={() => setCreating(false)} onSubmit={create} />}

      {pendingRole && (
        <ConfirmActionModal
          title="Confirmer le changement de rôle"
          recap={buildRoleChangeRecap(pendingRole.user.email, pendingRole.user.role, pendingRole.role)}
          consequence={
            pendingRole.role === "admin"
              ? "Ce compte pourra accéder au dashboard, modifier le catalogue et gérer les autres comptes."
              : "Ce compte perdra l'accès au dashboard et à toute modification du catalogue."
          }
          confirmLabel={`Passer en ${ROLE_LABELS[pendingRole.role]}`}
          danger
          requireText={pendingRole.user.email}
          requireTextLabel="Retapez l'adresse e-mail du compte pour confirmer"
          onConfirm={async () => {
            const ok = await setRole(pendingRole.user.id, pendingRole.role);
            if (ok) setPendingRole(null);
            return ok;
          }}
          onCancel={() => setPendingRole(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmActionModal
          title="Confirmer la suppression du compte"
          intro="Cette action est irréversible."
          recap={[
            { label: "Adresse e-mail", value: pendingDelete.email },
            { label: "Rôle", value: ROLE_LABELS[pendingDelete.role] },
          ]}
          consequence="Supprime définitivement le compte et toutes ses données : planning, congélateur, journal, listes de courses. Le catalogue n'est pas affecté."
          confirmLabel="Supprimer le compte"
          danger
          requireText={pendingDelete.email}
          requireTextLabel="Retapez l'adresse e-mail du compte pour confirmer"
          onConfirm={async () => {
            const ok = await remove(pendingDelete.id);
            if (ok) setPendingDelete(null);
            return ok;
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};
