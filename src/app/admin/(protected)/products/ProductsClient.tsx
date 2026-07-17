"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import Skeleton from "@/components/admin/Skeleton";
import type { Product, Category, HomeSection } from "@/types";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  image_url: "" as string | null,
  category_id: "",
  home_section_id: "",
  purchase_price: "0",
  sale_price: "0",
  discount_price: "",
  status: "available" as "available" | "unavailable",
};

// بيسمح بكتابة أرقام وعلامة عشرية واحدة بس، وبيسيب الحقل نص عادي
// عشان متحصلش مشكلة إن الكتابة بتتقطع أو بترجع تتصفر مع كل حرف
function isValidDecimal(value: string) {
  return /^\d*\.?\d*$/.test(value);
}

export default function ProductsClient({
  initialProducts,
  categories,
  homeSections,
}: {
  initialProducts: Product[];
  categories: Category[];
  homeSections: HomeSection[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable">("all");

  const productSections = homeSections.filter((s) => s.section_type === "products");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  function openNew() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      image_url: p.image_url,
      category_id: p.category_id ?? "",
      home_section_id: p.home_section_id ?? "",
      purchase_price: String(p.purchase_price),
      sale_price: String(p.sale_price),
      discount_price: p.discount_price != null ? String(p.discount_price) : "",
      status: p.status,
    });
    setShowForm(true);
  }

  async function refresh() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      home_section_id: form.home_section_id || null,
      purchase_price: parseFloat(form.purchase_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      status: form.status,
    };

    if (form.id) {
      await supabase.from("products").update(payload).eq("id", form.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد حذف المنتج؟")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    refresh();
  }

  async function toggleStatus(p: Product) {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ status: p.status === "available" ? "unavailable" : "available" })
      .eq("id", p.id);
    refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">إدارة المنتجات</h1>
        <button onClick={openNew} className="btn-accent rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1">
          <Plus className="w-4 h-4" /> إضافة منتج
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            placeholder="ابحث باسم المنتج..."
            className="w-full bg-surface2 border border-border rounded-lg pr-10 pl-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "available" | "unavailable")}
        >
          <option value="all">كل الحالات</option>
          <option value="available">متوفر</option>
          <option value="unavailable">غير متوفر</option>
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-3">
              <Skeleton className="w-full aspect-video mb-2" />
              <Skeleton className="w-2/3 h-4 mb-2" />
              <Skeleton className="w-1/3 h-3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-muted text-center py-16">مفيش منتجات مطابقة</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
          <div key={p.id} className="card p-3">
            <div className="w-full aspect-video rounded-lg bg-surface2 overflow-hidden mb-2">
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-xs text-muted">
                  شراء {p.purchase_price} / بيع {p.sale_price}
                  {p.discount_price != null && (
                    <span className="text-accent font-bold"> / خصم {p.discount_price}</span>
                  )}
                </div>
                {p.home_section_id && (
                  <div className="text-[11px] text-accent mt-0.5">
                    {productSections.find((s) => s.id === p.home_section_id)?.title ?? ""}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleStatus(p)}
                className={`text-[11px] px-2 py-1 rounded-full ${
                  p.status === "available" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                }`}
              >
                {p.status === "available" ? "متوفر" : "غير متوفر"}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(p)} className="flex-1 card py-1.5 text-xs flex items-center justify-center gap-1">
                <Pencil className="w-3 h-3" /> تعديل
              </button>
              <button onClick={() => handleDelete(p.id)} className="flex-1 card py-1.5 text-xs text-danger flex items-center justify-center gap-1">
                <Trash2 className="w-3 h-3" /> حذف
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="card p-6 w-full max-w-md flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">{form.id ? "تعديل منتج" : "منتج جديد"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">صورة المنتج</label>
              <CloudinaryUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">اسم المنتج</label>
              <input
                required
                placeholder="اسم المنتج"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">وصف المنتج</label>
              <textarea
                placeholder="وصف مختصر للمنتج"
                rows={2}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">القسم</label>
              <select
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">بدون قسم</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">
                يظهر في كارت الصفحة الرئيسية (اختياري)
              </label>
              <select
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.home_section_id}
                onChange={(e) => setForm({ ...form, home_section_id: e.target.value })}
              >
                <option value="">بدون — يظهر في القسم بس</option>
                {productSections.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">سعر الشراء (ج.م)</label>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder="0"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                  value={form.purchase_price}
                  onChange={(e) => {
                    if (isValidDecimal(e.target.value)) setForm({ ...form, purchase_price: e.target.value });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">سعر البيع (ج.م)</label>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder="0"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                  value={form.sale_price}
                  onChange={(e) => {
                    if (isValidDecimal(e.target.value)) setForm({ ...form, sale_price: e.target.value });
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">سعر بعد الخصم (اختياري — سيبه فاضي لو مفيش عرض)</label>
              <input
                type="text"
                inputMode="decimal"
                dir="ltr"
                placeholder="مثال: 45"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={form.discount_price}
                onChange={(e) => {
                  if (isValidDecimal(e.target.value)) setForm({ ...form, discount_price: e.target.value });
                }}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">حالة التوفر</label>
              <select
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "available" | "unavailable" })}
              >
                <option value="available">متوفر</option>
                <option value="unavailable">غير متوفر</option>
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
