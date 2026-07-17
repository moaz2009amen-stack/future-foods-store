"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

export default function AnnouncementBar({ text }: { text: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-accent text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Megaphone className="w-4 h-4 shrink-0" />
        <p className="flex-1 text-sm font-medium leading-snug">{text}</p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 opacity-80 hover:opacity-100"
          aria-label="إغلاق الإعلان"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
