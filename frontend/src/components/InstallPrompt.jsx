import React, { useEffect, useState } from "react";
import { X, Smartphone, Share, MoreVertical, Download } from "lucide-react";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. skip if user already dismissed or app is running standalone
    const isDismissed = localStorage.getItem("install_prompt_dismissed") === "true";
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    if (isDismissed || isStandalone) {
      return;
    }

    // 2. check screen size (only show on mobile viewports)
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768;
      if (!isMobileScreen) {
        setShowPrompt(false);
      } else {
        // recheck prompt eligibility
        const stillDismissed = localStorage.getItem("install_prompt_dismissed") === "true";
        if (!stillDismissed) setShowPrompt(true);
      }
    };

    // run check initially
    handleResize();
    window.addEventListener("resize", handleResize);

    // 3. detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. listen for native beforeinstallprompt (chrome/android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // only show if on mobile
      if (window.innerWidth < 768) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // trigger native installation prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
      localStorage.setItem("install_prompt_dismissed", "true");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("install_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="absolute bottom-22 left-4 right-4 bg-white dark:bg-bg-dark-card border border-zinc-150 dark:border-zinc-900 rounded-xl p-4 shadow-xl z-50 flex flex-col gap-3 animate-slide-up select-none">
      {/* header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Smartphone className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
              install hrms mobile app
            </h4>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
              add to homescreen for offline access & faster launches
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 p-0.5 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* instruction panel based on browser type */}
      <div className="bg-zinc-50 dark:bg-bg-dark-obsidian/45 border border-zinc-100 dark:border-zinc-900/60 p-3 rounded-lg text-[10.5px] leading-relaxed text-zinc-450 dark:text-zinc-500 font-medium">
        {deferredPrompt ? (
          <div className="flex flex-col gap-2">
            <span>one-click installation is supported on this browser!</span>
            <button
              onClick={handleInstallClick}
              className="w-full py-2 bg-brand-primary text-white font-bold text-xs rounded-lg active:scale-95 transition-spring flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>install now</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span>tap the share icon</span>
            <span className="inline-flex items-center justify-center p-1 bg-zinc-150 dark:bg-zinc-800 rounded text-zinc-950 dark:text-white">
              <Share className="w-3 h-3" />
            </span>
            <span>at the bottom of Safari, and select</span>
            <span className="font-bold text-zinc-950 dark:text-white">"Add to Home Screen"</span>
            <span>to install.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span>tap the browser menu</span>
            <span className="inline-flex items-center justify-center p-1 bg-zinc-150 dark:bg-zinc-800 rounded text-zinc-950 dark:text-white">
              <MoreVertical className="w-3 h-3" />
            </span>
            <span>in your browser toolbar, and select</span>
            <span className="font-bold text-zinc-950 dark:text-white">"Add to Home Screen"</span>
            <span>or</span>
            <span className="font-bold text-zinc-950 dark:text-white">"Install App"</span>
            <span>.</span>
          </div>
        )}
      </div>
    </div>
  );
}
