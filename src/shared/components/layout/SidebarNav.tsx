import { UtensilsCrossed, CalendarDays, ShoppingCart, Package, Snowflake } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: <UtensilsCrossed />, path: "/recipes", label: "Recettes" },
  { icon: <CalendarDays />, path: "/planning", label: "Menu" },
  { icon: <Package />, path: "/household", label: "Quotidien" },
  { icon: <ShoppingCart />, path: "/shopping", label: "Courses" },
  { icon: <Snowflake />, path: "/freezer", label: "Congélateur" },
];

export const SidebarNav = () => {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-3 tablet:gap-5">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          title={item.label}
          className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${
            location.pathname.startsWith(item.path)
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
