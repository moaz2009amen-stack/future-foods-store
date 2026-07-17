"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import type { HomeSection, HomeSectionType } from "@/types";

const emptyForm = {
  id: "",
  title: "",
  description: "",
  image_url: "" as string | null,
  section_type: "products" as HomeSectionType,
};

export default function HomeSectionsClient({ initialSections }: { initialSections: HomeSection[] }) {
  const [sections, setSections] = useState<HomeSection[]>(
    [...initialSections].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from("home_sections").select("*").order("sort_order");
    setSections((data as HomeSection[]) ?? []);
  }

  function openNew() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(s: HomeSection) {
    setForm({
      id: s.id,
      title: s.title,
      description: s.description ?? "",
      image_url: s.image_url,
      section_type: s.section_type,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    if (form.id) {
      await supabase
        .from("home_sections")
        .update({
          title: form.title,
          description: form.description || null,
          image_url: form.image_url || null,
          section_type: form.section_type,
        })
        .eq("id", form.id);
    } else {
      await supabase.from("home_sections").insert({
        title: form.title,
        description: form.description || null,
        image_url: form.image_url || null,
        section_type: form.section_type,
        sort_order: sections.length,
      });
    }

    setSaving(false);
    setShowForm(false);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد حذف الكارت؟ المنتجات المرتبطة بيه هتفضل موجودة بس هتشيل الربط.")) return;
    const supabase = createClient();
    await supabase.from("home_sections").delete().eq("id", id);
    refresh();
  }

  async function toggleActive(s: HomeSection) {
    const supabase = createClient();
    await supabase.from("home_sections").update({ is_active: !s.is_active }).eq("id", s.id);
    refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const supabase = createClient();
    const a = sections[index];
    const b = sections[target];

    await Promise.all([
      supabase.from("home_sections").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("home_sections").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">كروت الصفحة الرئيسية</h1>
        <button onClick={openNew} className="btn-accent rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1">
          <Plus className="w-4 h-4" /> كارت جديد
        </button>
      </div>
      <p className="text-muted text-sm mb-6">
        دول الكروت اللي بتظهر في الصفحة الرئيسية للعملاء. كارت من نوع &quot;أقسام&quot; بيعرض كل الأقسام، وكارت من نوع &quot;منتجات&quot; بتقدر تحدد له منتجات من صفحة المنتجات.
      </p>

      <div className="flex flex-col gap-3">
        {sections.map((s, i) => (
          <div key={s.id} className="card p-4 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-surface2 overflow-hidden shrink-0">
              {s.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{s.title}</div>
              <div className="text-xs text-muted">
                {s.section_type === "categories" ? "كارت الأقسام" : "كارت منتجات"}
                {!s.is_active && <span className="text-danger"> · غير مفعّل</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="card p-2 disabled:opacity-30">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="card p-2 disabled:opacity-30">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button onClick={() => toggleActive(s)} className="card p-2" title={s.is_active ? "إخفاء" : "إظهار"}>
                {s.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted" />}
              </button>
              <button onClick={() => openEdit(s)} className="card p-2">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="card p-2 text-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="card p-6 w-full max-w-md flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">{form.id ? "تعديل كارت" : "كارت جديد"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">صورة الكارت</label>
              <CloudinaryUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">اسم الكارت</label>
              <input
                required
                placeholder="مثال: عروض اليوم"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">وصف مختصر (اختياري)</label>
              <textarea
                rows={2}
                placeholder="وصف قصير يظهر تحت اسم الكارت"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">نوع الكارت</label>
              <select
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.section_type}
                onChange={(e) => setForm({ ...form, section_type: e.target.value as HomeSectionType })}
              >
                <option value="products">منتجات (زي عروض اليوم)</option>
                <option value="categories">أقسام (بيعرض كل الأقسام)</option>
              </select>
            </div>

            <button disabled={saving} className="btn-accent rounded-lg py-2.5 font-bold disabled:opacity-50">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
