import { ReactNode } from "react";
import { Link } from "react-router-dom";

export interface SidebarLinkProps {
  to: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}

export const SidebarLink = ({ to, label, icon, active }: SidebarLinkProps) => (
  <Link
    to={to}
    title={label}
    className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${
      active
        ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
        : "text-slate-400 hover:bg-muted"
    }`}
  >
    {icon}
  </Link>
);
