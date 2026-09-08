import { UserRole } from "../../../../core/services/authService";

export interface RoleToggleProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  guestDisabled?: boolean;
}

const OPTIONS: { role: UserRole; label: string }[] = [
  { role: "guest", label: "Invité" },
  { role: "admin", label: "Admin" },
];

export const RoleToggle = ({ value, onChange, disabled, guestDisabled }: RoleToggleProps) => (
  <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
    {OPTIONS.map((option) => {
      const active = value === option.role;
      const optionDisabled = disabled || (guestDisabled && option.role === "guest" && !active);
      return (
        <button
          key={option.role}
          type="button"
          disabled={optionDisabled}
          onClick={() => onChange(option.role)}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            active ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
