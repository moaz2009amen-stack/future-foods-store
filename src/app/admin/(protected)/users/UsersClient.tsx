"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, KeyRound, Ban, CheckCircle, Trash2 } from "lucide-react";
import type { AppUser, UserRole } from "@/types";

export default function UsersClient({ initialUsers }: { initialUsers: AppUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "worker" as UserRole });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "حدث خطأ");
      return;
    }
    setShowForm(false);
    setForm({ username: "", password: "", role: "worker" });
    router.refresh();
    setUsers([...users, { id: crypto.randomUUID(), username: form.username, role: form.role, active: true }]);
  }

  async function toggleActive(u: AppUser) {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    setUsers(users.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)));
  }

  async function resetPassword(u: AppUser) {
    const password = prompt(`كلمة مرور جديدة لـ ${u.username}:`);
    if (!password) return;
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    alert("تم تغيير كلمة المرور");
  }

  async function deleteUser(u: AppUser) {
    if (!confirm(`تأكيد حذف ${u.username}؟`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    setUsers(users.filter((x) => x.id !== u.id));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">إدارة المستخدمين</h1>
        <button onClick={() => setShowForm(true)} className="btn-accent rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1">
          <Plus className="w-4 h-4" /> مستخدم جديد
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div key={u.id} className="card p-3 flex justify-between items-center">
            <div>
              <div className="font-bold text-sm">{u.username}</div>
              <div className="text-xs text-muted">{u.role === "owner" ? "أونر" : "عامل"} · {u.active ? "نشط" : "متوقف"}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetPassword(u)} className="card p-2" title="إعادة تعيين كلمة المرور">
                <KeyRound className="w-4 h-4" />
              </button>
              <button onClick={() => toggleActive(u)} className="card p-2" title={u.active ? "إيقاف" : "تفعيل"}>
                {u.active ? <Ban className="w-4 h-4 text-warning" /> : <CheckCircle className="w-4 h-4 text-success" />}
              </button>
              <button onClick={() => deleteUser(u)} className="card p-2 text-danger" title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="card p-6 w-full max-w-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">مستخدم جديد</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <input
              required
              placeholder="اسم المستخدم"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              required
              type="password"
              placeholder="كلمة المرور"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="worker">عامل (Worker)</option>
              <option value="owner">أونر (Owner)</option>
            </select>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button disabled={loading} className="btn-accent rounded-lg py-2.5 font-bold disabled:opacity-50">
              {loading ? "جاري الإنشاء..." : "إنشاء المستخدم"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
