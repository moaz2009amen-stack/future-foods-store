"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

export default function ProfileClient({
  initialUsername,
  role,
}: {
  initialUsername: string;
  role: UserRole;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password && password !== confirmPassword) {
      setError("كلمة المرور وتأكيدها مش متطابقين");
      return;
    }
    if (password && password.length < 6) {
      setError("كلمة المرور لازم تكون 6 حروف على الأقل");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username !== initialUsername ? username : undefined,
        password: password || undefined,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "حدث خطأ أثناء الحفظ");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-6">الملف الشخصي</h1>

      <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-4">
        <div className="text-sm text-muted">
          الدور: <span className="font-bold text-text">{role === "owner" ? "أونر" : "عامل"}</span>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">اسم المستخدم</label>
          <input
            required
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">كلمة مرور جديدة (سيبها فاضية لو مش عايز تغيرها)</label>
          <input
            type="password"
            placeholder="••••••"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {password && (
          <div>
            <label className="text-xs text-muted block mb-1">تأكيد كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        <button disabled={saving} className="btn-accent rounded-lg py-2.5 font-bold disabled:opacity-50">
          {saving ? "جاري الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ التعديلات"}
        </button>
      </form>
    </div>
  );
}
