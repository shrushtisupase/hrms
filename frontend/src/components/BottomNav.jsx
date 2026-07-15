import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { LayoutGrid, Clock, Calendar, UserRound, Users, BarChart3, Settings, UserMinus } from "lucide-react";

// sticky bottom app tab bar using react-router-dom Links
export default function BottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const tabs = isAdminOrHR
    ? [
        { id: "home", label: "home", path: "/", icon: LayoutGrid },
        { id: "directory", label: "staff", path: "/employees", icon: Users },
        { id: "analytics", label: "charts", path: "/admin/analytics", icon: BarChart3 },
        { id: "ops", label: "ops", path: "/admin", icon: Settings },
        { id: "clearance", label: "exits", path: "/admin/clearance", icon: UserMinus },
        { id: "profile", label: "profile", path: "/profile", icon: UserRound },
      ]
    : [
        { id: "home", label: "home", path: "/", icon: LayoutGrid },
        { id: "logs", label: "logs", path: "/logs", icon: Clock },
        { id: "leaves", label: "leaves", path: "/leaves", icon: Calendar },
        { id: "profile", label: "profile", path: "/profile", icon: UserRound },
      ];

  return (
    <div className="w-full bg-white/80 dark:bg-bg-dark-obsidian/80 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-900 py-2 px-2 flex items-center justify-around z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          currentPath === tab.path ||
          (tab.id === "directory" && currentPath.startsWith("/employees")) ||
          (tab.id === "ops" && currentPath === "/admin") ||
          (tab.id === "clearance" && currentPath === "/admin/clearance") ||
          (tab.id === "analytics" && currentPath === "/admin/analytics");

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex flex-col items-center justify-center p-1 rounded transition-all active:scale-95 duration-200 shrink-0 ${
              isAdminOrHR ? "w-12 md:w-16" : "w-16"
            } ${
              isActive
                ? "bg-brand-primary-light text-brand-primary dark:bg-brand-primary-dark/25 dark:text-brand-primary shadow-xs"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-550 dark:hover:text-zinc-300"
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
            <span
              className={`text-[9px] tracking-wide font-bold transition-colors mt-0.5 uppercase ${
                isActive
                  ? "text-brand-primary"
                  : "text-zinc-400 dark:text-zinc-650"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
