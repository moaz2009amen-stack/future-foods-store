"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "اسم المستخدم أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    // تحويل كامل للصفحة (مش router.push) عشان نضمن إن المتصفح
    // بعت الكوكيز الجديدة بتاعة الجلسة مع الطلب الجاي على طول
    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-bold text-center mb-2">لوحة تحكم سر السعادة ستور</h1>
        <input
          required
          placeholder="اسم المستخدم"
          className="bg-surface2 border border-border rounded-lg px-4 py-3 outline-none focus:border-accent"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="كلمة المرور"
          className="bg-surface2 border border-border rounded-lg px-4 py-3 outline-none focus:border-accent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-danger text-sm text-center">{error}</p>}
        <button disabled={loading} className="btn-accent rounded-lg py-3 font-bold disabled:opacity-50">
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}