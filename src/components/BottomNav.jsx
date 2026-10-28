import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Tractor, TrendingUp, Store, LayoutDashboard } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Equipment", path: "/equipment", icon: Tractor },
    { name: "Advisor", path: "/advisor", icon: TrendingUp },
    { name: "Market", path: "/marketplace", icon: Store },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EAE5] px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const active = isActive(link.path);
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-150 ${
                active ? "text-[#15803D]" : "text-[#647067] hover:text-[#17231D]"
              }`}
            >
              <div className={`p-1 rounded-lg ${active ? "bg-[#15803D]/10" : ""}`}>
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${active ? "font-bold" : "font-medium"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
