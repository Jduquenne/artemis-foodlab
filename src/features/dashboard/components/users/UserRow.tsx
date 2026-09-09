import { Trash2 } from "lucide-react";
import { AdminUser } from "../../../../core/services/usersService";
import { UserRole } from "../../../../core/services/authService";
import { formatDateMedium } from "../../../../shared/utils/dateUtils";
import { RoleToggle } from "./RoleToggle";

export interface UserRowProps {
  user: AdminUser;
  isSelf: boolean;
  isLastAdmin: boolean;
  onAskRole: (user: AdminUser, role: UserRole) => void;
  onAskDelete: (user: AdminUser) => void;
}

export const UserRow = ({ user, isSelf, isLastAdmin, onAskRole, onAskDelete }: UserRowProps) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">
        {user.displayName || user.email}
        {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">vous</span>}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {user.displayName ? user.email : `Créé le ${formatDateMedium(user.createdAt)}`}
      </p>
    </div>

    <RoleToggle
      value={user.role}
      onChange={(role) => onAskRole(user, role)}
      disabled={isSelf}
      guestDisabled={isLastAdmin}
    />

    <button
      type="button"
      aria-label={`Supprimer ${user.email}`}
      disabled={isSelf || isLastAdmin}
      onClick={() => onAskDelete(user)}
      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
    >
      <Trash2 size={16} />
    </button>
  </div>
);
