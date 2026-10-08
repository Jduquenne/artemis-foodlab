import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import { useUsers } from "../../../../shared/hooks/useUsers";
import { useAuthStore } from "../../../../shared/store/useAuthStore";
import { AdminUser, UserRole } from "../../../../core/domain/user";
import { ROLE_LABELS, buildRoleChangeRecap, excludeDemoAccounts } from "../../../../core/logic/dashboard/userFormLogic";
import { UserRow } from "./UserRow";
import { UserFormModal } from "./UserFormModal";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { DataPanelShell } from "../common/DataPanelShell";
import { DataList } from "../common/DataList";

export const UsersPanel = () => {
  const { users: allUsers, loading, loadError, reload, create, setRole, remove } = useUsers();
  const users = useMemo(() => excludeDemoAccounts(allUsers), [allUsers]);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [creating, setCreating] = useState(false);
  const [pendingRole, setPendingRole] = useState<{ user: AdminUser; role: UserRole } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <DataPanelShell title="Utilisateurs" count={users.length} onAdd={() => setCreating(true)}>
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
      ) : (
        <DataList isEmpty={users.length === 0} emptyMessage="Aucun compte pour l'instant.">
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
        </DataList>
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
    </DataPanelShell>
  );
};
