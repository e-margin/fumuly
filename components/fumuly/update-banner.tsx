"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Listen for SW_UPDATED message from service worker
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "SW_UPDATED") {
        setShowUpdate(true);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates periodically (every 30 minutes)
        setInterval(() => registration.update(), 30 * 60 * 1000);

        // Detect when a new SW is waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              setShowUpdate(true);
            }
          });
        });
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3 pointer-events-none">
      <button
        onClick={handleUpdate}
        className="pointer-events-auto flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg animate-in slide-in-from-top duration-300"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        新しいバージョンがあります。タップで更新
      </button>
    </div>
  );
}
