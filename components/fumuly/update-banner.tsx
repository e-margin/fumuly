"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // When the new SW takes over, reload the page
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates periodically (every 30 minutes)
        setInterval(() => registration.update(), 30 * 60 * 1000);

        // If there's already a waiting worker (e.g., from a previous visit)
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setShowUpdate(true);
        }

        // Detect when a new SW is found and starts installing
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version is ready and waiting
              waitingWorkerRef.current = newWorker;
              setShowUpdate(true);
            }
          });
        });
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  const handleUpdate = () => {
    const waitingWorker = waitingWorkerRef.current;
    if (waitingWorker) {
      // Tell the waiting SW to activate
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      // Fallback: just reload
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-100 flex justify-center p-3 pointer-events-none">
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
