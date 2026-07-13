"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // مفيش داعي نعرض خطأ للمستخدم، التسجيل مش أساسي لعمل الموقع
      });
    }
  }, []);

  return null;
}
