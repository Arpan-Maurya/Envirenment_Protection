import { NavLink } from "react-router-dom";
import { Home, Zap, Target, User, Bot } from "lucide-react";

const mobileItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Zap, label: "Actions", path: "/actions" },
  { icon: Bot, label: "AI Chat", path: "/chat" },
  { icon: Target, label: "Missions", path: "/missions" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function MobileNav() {
  return (
    <div className="flex justify-around items-center px-2 py-3">
      {mobileItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            "flex flex-col items-center space-y-1 min-w-[64px] " +
            (isActive ? "text-primary" : "text-neutral-400 hover:text-neutral-600")
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={22} className={isActive ? "fill-primary/20" : ""} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
