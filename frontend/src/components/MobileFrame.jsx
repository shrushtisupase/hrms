import React from "react";
import InstallPrompt from "./InstallPrompt.jsx";

// fixed-viewport responsive container for mobile and desktop screens
export default function MobileFrame({ children }) {
  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-bg-dark-obsidian flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-4xl h-full flex flex-col bg-white dark:bg-bg-dark-obsidian shadow-xs border-0 md:border-x border-zinc-100 dark:border-zinc-900 overflow-hidden relative">
        {children}
        <InstallPrompt />
      </div>
    </div>
  );
}
