"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after window load to avoid blocking critical assets load
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("STEM PWA: Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("STEM PWA: Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
