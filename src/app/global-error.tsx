"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ background: "#fdf8f8", color: "#241414", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ textAlign: "center", maxWidth: 380 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>حصل خطأ في تحميل الموقع</h1>
            <p style={{ color: "#8a6b6b", marginBottom: 24 }}>حاول تحديث الصفحة تاني.</p>
            <button
              onClick={reset}
              style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: 999,
                padding: "12px 32px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              حاول تاني
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}