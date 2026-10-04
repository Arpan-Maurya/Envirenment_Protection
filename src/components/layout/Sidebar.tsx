import { NavLink } from "react-router-dom";
import { 
  BarChart2, 
  Leaf, 
  Map, 
  Target, 
  Home, 
  User, 
  Settings, 
  Trophy,
  MessageCircle,
  History
} from "lucide-react";
import { useAppStore } from "../../store";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: User, label: "My Profile", path: "/profile" },
  { icon: Leaf, label: "Footprint Breakdown", path: "/footprint" },
  { icon: MessageCircle, label: "EcoAgent AI", path: "/chat" },
  { icon: BarChart2, label: "What-If Simulator", path: "/simulator" },
  { icon: Map, label: "Action Plan", path: "/actions" },
  { icon: Target, label: "Missions", path: "/missions" },
  { icon: History, label: "Activity History", path: "/activities" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const user = useAppStore(state => state.user);

  return (
    <div className="flex flex-col h-full bg-white text-neutral-900 justify-between">
      <div>
        <div className="px-6 py-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0f2e20] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20">
            <Leaf size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter text-neutral-900 font-heading leading-none">ECOAGENT AI</h1>
            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">Sustain Intelligence</p>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm w-full " +
                (isActive
                  ? "bg-green-50 text-green-700"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900")
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? "opacity-100" : "opacity-80"} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <div className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-100 flex items-center space-x-3">
          <div className="text-xl">🌱</div>
          <p className="text-xs text-green-800 font-medium leading-tight">Together, we can build a sustainable future 🌍</p>
        </div>

        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
            <img src={"https://api.dicebear.com/7.x/notionists/svg?seed=" + user.name} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 truncate">Level {user.level} • {user.xp} XP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
