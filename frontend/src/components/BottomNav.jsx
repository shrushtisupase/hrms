import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { LayoutGrid, Clock, Calendar, UserRound, Users } from "lucide-react";

// sticky bottom app tab bar using react-router-dom Links
export default function BottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  const tabs = [
    { id: "home", label: "home", path: "/", icon: LayoutGrid },
    { id: "logs", label: "logs", path: "/logs", icon: Clock },
    { id: "leaves", label: "leaves", path: "/leaves", icon: Calendar },
  ];

  if (isAdminOrHR) {
    tabs.push({ id: "directory", label: "staff", path: "/employees", icon: Users });
  }

  tabs.push({ id: "profile", label: "profile", path: "/profile", icon: UserRound });

  return (
    <div className="w-full bg-white/80 dark:bg-bg-dark-obsidian/80 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-900 py-2.5 px-4 flex items-center justify-around z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path || (tab.id === "directory" && currentPath.startsWith("/employees"));

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg active:scale-95 transition-spring w-16 ${
              isActive
                ? "bg-brand-primary-light text-brand-primary dark:bg-brand-primary-dark/25 dark:text-brand-primary shadow-xs"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span
              className={`text-[10px] tracking-wide font-medium transition-colors duration-300 ${
                isActive
                  ? "text-brand-primary font-bold"
                  : "text-zinc-400 dark:text-zinc-600"
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
