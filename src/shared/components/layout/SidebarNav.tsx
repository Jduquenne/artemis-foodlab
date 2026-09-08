import { LayoutDashboard, UtensilsCrossed, CalendarDays, ShoppingCart, Package, Snowflake, ChefHat, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";

const navItems = [
  { icon: <LayoutDashboard />, path: "/journal", label: "Journal" },
  { icon: <CalendarDays />, path: "/planning", label: "Menu" },
  { icon: <UtensilsCrossed />, path: "/recipes", label: "Recettes" },
  { icon: <ShoppingCart />, path: "/shopping", label: "Courses" },
  { icon: <Package />, path: "/household", label: "Quotidien" },
  { icon: <Snowflake />, path: "/freezer", label: "Congélateur" },
];

const adminNavItems = [
  { icon: <ChefHat />, path: "/recipe-builder", label: "Créateur" },
  { icon: <BarChart3 />, path: "/dashboard", label: "Dashboard" },
];

export const SidebarNav = () => {
  const location = useLocation();
  const isAdmin = useIsAdmin();
  const items = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <nav className="flex flex-col gap-3 tablet:gap-5">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          title={item.label}
          className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${location.pathname.startsWith(item.path)
            ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200"
            }`}
        >
          {item.icon}
        </Link>
      ))}
    </nav>
  );
};
