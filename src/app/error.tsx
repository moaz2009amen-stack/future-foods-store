"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-danger" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">حصل خطأ غير متوقع</h1>
        <p className="text-muted mb-8">
          حاول تاني، ولو المشكلة استمرت كلم الدعم الفني.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-accent rounded-full px-6 py-3 font-bold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            حاول تاني
          </button>
          <Link href="/" className="card px-6 py-3 rounded-full font-bold">
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}