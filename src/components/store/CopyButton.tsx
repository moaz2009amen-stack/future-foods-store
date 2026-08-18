"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // فشل النسخ (نادر جداً) — مفيش داعي نعطّل الصفحة عشان كده
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full card"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-success" /> اتنسخ
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> نسخ
        </>
      )}
    </button>
  );
}
