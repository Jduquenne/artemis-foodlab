import { LayoutDashboard, UtensilsCrossed, CalendarDays, ShoppingCart, Snowflake } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SidebarLink } from "./SidebarLink";

const navItems = [
  { icon: <LayoutDashboard />, path: "/journal", label: "Journal" },
  { icon: <CalendarDays />, path: "/planning", label: "Menu" },
  { icon: <UtensilsCrossed />, path: "/recipes", label: "Recettes" },
  { icon: <ShoppingCart />, path: "/shopping", label: "Courses" },
  { icon: <Snowflake />, path: "/freezer", label: "Congélateur" },
];

export const SidebarNav = () => {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-3 tablet:gap-5">
      {navItems.map((item) => (
        <SidebarLink key={item.path} to={item.path} label={item.label} icon={item.icon} active={location.pathname.startsWith(item.path)} />
      ))}
    </nav>
  );
};
