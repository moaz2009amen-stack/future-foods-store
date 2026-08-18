"use client";

import { useState } from "react";
import { Plus, Trash2, X, Power } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Coupon, CouponType } from "@/types";

const emptyForm = {
  code: "",
  type: "percentage" as CouponType,
  value: "",
  min_order: "0",
  max_uses: "",
  expires_at: "",
};

function isValidDecimal(value: string) {
  return /^\d*\.?\d*$/.test(value);
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      min_order: parseFloat(form.min_order) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "الكود ده مستخدم بالفعل" : "حدث خطأ أثناء الحفظ");
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    refresh();
  }

  async function toggleActive(c: Coupon) {
    const supabase = createClient();
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد حذف الكوبون؟")) return;
    const supabase = createClient();
    await supabase.from("coupons").delete().eq("id", id);
    refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">الكوبونات</h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="btn-accent rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> كوبون جديد
        </button>
      </div>

      {coupons.length === 0 ? (
        <p className="text-muted text-center py-16">لا توجد كوبونات بعد</p>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map((c) => (
            <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold flex items-center gap-2">
                  {c.code}
                  {!c.is_active && <span className="text-xs text-danger">(متوقف)</span>}
                </div>
                <div className="text-xs text-muted mt-1">
                  خصم {c.type === "percentage" ? `${c.value}%` : `${c.value} ج.م`}
                  {c.min_order > 0 && ` — حد أدنى ${c.min_order} ج.م`}
                  {c.max_uses != null && ` — استخدم ${c.used_count}/${c.max_uses}`}
                  {c.expires_at && ` — ينتهي ${new Date(c.expires_at).toLocaleDateString("ar-EG")}`}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(c)} className="card p-2" title={c.is_active ? "إيقاف" : "تفعيل"}>
                  <Power className={`w-4 h-4 ${c.is_active ? "text-success" : "text-muted"}`} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="card p-2 text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="card p-6 w-full max-w-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">كوبون جديد</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">كود الكوبون</label>
              <input
                required
                dir="ltr"
                placeholder="مثال: WELCOME10"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">نوع الخصم</label>
              <select
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ج.م)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">
                قيمة الخصم {form.type === "percentage" ? "(%)" : "(ج.م)"}
              </label>
              <input
                required
                type="text"
                inputMode="decimal"
                dir="ltr"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={form.value}
                onChange={(e) => {
                  if (isValidDecimal(e.target.value)) setForm({ ...form, value: e.target.value });
                }}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">حد أدنى للطلب (اختياري)</label>
              <input
                type="text"
                inputMode="decimal"
                dir="ltr"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={form.min_order}
                onChange={(e) => {
                  if (isValidDecimal(e.target.value)) setForm({ ...form, min_order: e.target.value });
                }}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">أقصى عدد استخدام (اختياري)</label>
              <input
                type="number"
                dir="ltr"
                placeholder="بدون حد"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">تاريخ الانتهاء (اختياري)</label>
              <input
                type="date"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button disabled={saving} className="btn-accent rounded-lg py-2.5 font-bold disabled:opacity-50">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
