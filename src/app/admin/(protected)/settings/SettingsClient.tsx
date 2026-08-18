"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import type { StoreSettings, Category } from "@/types";

function isValidDecimal(value: string) {
  return /^\d*\.?\d*$/.test(value);
}

export default function SettingsClient({
  initialSettings,
  initialCategories,
}: {
  initialSettings: StoreSettings;
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(String(initialSettings.delivery_fee ?? 0));
  const [minOrderInput, setMinOrderInput] = useState(String(initialSettings.min_order ?? 0));
  const [freeThresholdInput, setFreeThresholdInput] = useState(
    initialSettings.free_delivery_threshold != null ? String(initialSettings.free_delivery_threshold) : ""
  );
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("store_settings")
      .update({
        store_name: settings.store_name,
        store_name_en: settings.store_name_en,
        logo_url: settings.logo_url,
        banner_url: settings.banner_url,
        phone: settings.phone,
        address: settings.address,
        delivery_fee: parseFloat(deliveryFeeInput) || 0,
        min_order: parseFloat(minOrderInput) || 0,
        free_delivery_threshold: freeThresholdInput ? parseFloat(freeThresholdInput) : null,
        working_hours: settings.working_hours,
        whatsapp_number: settings.whatsapp_number || null,
        facebook_url: settings.facebook_url || null,
        instagram_url: settings.instagram_url || null,
        tiktok_url: settings.tiktok_url || null,
        website_url: settings.website_url || null,
        announcement: settings.announcement || null,
        announcement_enabled: settings.announcement_enabled,
        cash_payment_details: settings.cash_payment_details || null,
        instapay_account_name: settings.instapay_account_name || null,
        instapay_number: settings.instapay_number || null,
        wallet_account_name: settings.wallet_account_name || null,
        wallet_number: settings.wallet_number || null,
        meta_pixel_id: settings.meta_pixel_id || null,
        ga4_measurement_id: settings.ga4_measurement_id || null,
        theme: "white",
      })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .insert({
        name: newCategory.trim(),
        image_url: newCategoryImage,
        sort_order: categories.length,
      })
      .select("*")
      .single();
    if (data) setCategories([...categories, data]);
    setNewCategory("");
    setNewCategoryImage(null);
  }

  async function deleteCategory(id: string) {
    if (!confirm("تأكيد حذف القسم؟")) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    setCategories(categories.filter((c) => c.id !== id));
  }

  async function saveEditCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingCategory(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ name: editingCategory.name, image_url: editingCategory.image_url })
      .eq("id", editingCategory.id)
      .select("*")
      .single();
    setSavingCategory(false);
    if (error) {
      alert("تعذر حفظ التعديل: " + error.message);
      return;
    }
    if (data) {
      setCategories(categories.map((c) => (c.id === data.id ? data : c)));
    }
    setEditingCategory(null);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">إعدادات النظام</h1>

      <form onSubmit={saveSettings} className="card p-5 flex flex-col gap-4 mb-8">
        <h2 className="font-bold">بيانات الماركت</h2>

        <div>
          <label className="text-xs text-muted block mb-1">
            شعار الماركت (بيظهر جمب اسم الماركت في أعلى الموقع)
          </label>
          <CloudinaryUpload value={settings.logo_url} onChange={(url) => setSettings({ ...settings, logo_url: url })} />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">صورة البانر الرئيسي</label>
          <CloudinaryUpload value={settings.banner_url} onChange={(url) => setSettings({ ...settings, banner_url: url })} />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">اسم الماركت بالعربية</label>
          <input
            placeholder="مثال: سر السعادة ستور"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={settings.store_name}
            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">الاسم بالإنجليزية</label>
          <input
            placeholder="مثال: Future Foods Store"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={settings.store_name_en}
            onChange={(e) => setSettings({ ...settings, store_name_en: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">رقم الهاتف</label>
          <input
            placeholder="01xxxxxxxxx"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={settings.phone ?? ""}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">عنوان الماركت</label>
          <input
            placeholder="العنوان بالتفصيل"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={settings.address ?? ""}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">سعر التوصيل (ج.م)</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              placeholder="0"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
              value={deliveryFeeInput}
              onChange={(e) => {
                if (isValidDecimal(e.target.value)) setDeliveryFeeInput(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">الحد الأدنى للطلب (ج.م)</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              placeholder="0"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
              value={minOrderInput}
              onChange={(e) => {
                if (isValidDecimal(e.target.value)) setMinOrderInput(e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">
            حد التوصيل المجاني (اختياري — سيبه فاضي لو مش عايز الميزة دي)
          </label>
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            placeholder="مثال: 200"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
            value={freeThresholdInput}
            onChange={(e) => {
              if (isValidDecimal(e.target.value)) setFreeThresholdInput(e.target.value);
            }}
          />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">مواعيد العمل</label>
          <input
            placeholder="مثال: يومياً 9ص - 12م"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={settings.working_hours ?? ""}
            onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
          />
        </div>

        <div className="border-t border-border pt-4">
          <label className="text-xs text-muted block mb-1">رقم واتساب (بالصيغة الدولية بدون +)</label>
          <input
            dir="ltr"
            placeholder="201xxxxxxxxx"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
            value={settings.whatsapp_number ?? ""}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
          />
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="font-bold mb-3">بيانات حسابات الدفع</h2>
          <p className="text-xs text-muted mb-3">
            البيانات دي بتظهر للعميل وقت ما يختار طريقة الدفع في صفحة إتمام الطلب، مع زرار نسخ سريع.
          </p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">ملاحظة للدفع كاش عند الاستلام (اختياري)</label>
              <input
                placeholder="مثال: برجاء تجهيز المبلغ بالظبط"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                value={settings.cash_payment_details ?? ""}
                onChange={(e) => setSettings({ ...settings, cash_payment_details: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">اسم صاحب حساب إنستاباي</label>
                <input
                  placeholder="مثال: محمد أحمد"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                  value={settings.instapay_account_name ?? ""}
                  onChange={(e) => setSettings({ ...settings, instapay_account_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">رقم إنستاباي / الرابط</label>
                <input
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                  value={settings.instapay_number ?? ""}
                  onChange={(e) => setSettings({ ...settings, instapay_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">اسم صاحب المحفظة الإلكترونية</label>
                <input
                  placeholder="مثال: محمد أحمد"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
                  value={settings.wallet_account_name ?? ""}
                  onChange={(e) => setSettings({ ...settings, wallet_account_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">رقم المحفظة</label>
                <input
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                  value={settings.wallet_number ?? ""}
                  onChange={(e) => setSettings({ ...settings, wallet_number: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm font-bold mb-2">
            <input
              type="checkbox"
              checked={settings.announcement_enabled}
              onChange={(e) => setSettings({ ...settings, announcement_enabled: e.target.checked })}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            تفعيل شريط إعلان فوق البانر
          </label>
          <textarea
            rows={2}
            placeholder="مثال: عروض العيد جارية الآن — خصومات تصل لـ 30%"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            value={settings.announcement ?? ""}
            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
          />
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="font-bold mb-3">روابط التواصل الاجتماعي (اختياري)</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">رابط فيسبوك</label>
              <input
                dir="ltr"
                placeholder="https://facebook.com/..."
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={settings.facebook_url ?? ""}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">رابط إنستجرام</label>
              <input
                dir="ltr"
                placeholder="https://instagram.com/..."
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={settings.instagram_url ?? ""}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">رابط تيك توك</label>
              <input
                dir="ltr"
                placeholder="https://tiktok.com/@..."
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={settings.tiktok_url ?? ""}
                onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">رابط الموقع الإلكتروني</label>
              <input
                dir="ltr"
                placeholder="https://..."
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={settings.website_url ?? ""}
                onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="font-bold mb-1">تتبع وإحصائيات الإعلانات</h2>
          <p className="text-xs text-muted mb-3">
            من Meta Business Manager وGoogle Analytics هتلاقي الأكواد دي. سيبها فاضية لو لسه معملتش الحسابات دي.
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Meta Pixel ID</label>
              <input
                dir="ltr"
                placeholder="مثال: 1234567890123456"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={settings.meta_pixel_id ?? ""}
                onChange={(e) => setSettings({ ...settings, meta_pixel_id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">GA4 Measurement ID</label>
              <input
                dir="ltr"
                placeholder="مثال: G-XXXXXXXXXX"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-left"
                value={settings.ga4_measurement_id ?? ""}
                onChange={(e) => setSettings({ ...settings, ga4_measurement_id: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button disabled={saving} className="btn-accent rounded-lg py-2.5 font-bold disabled:opacity-50">
          {saving ? "جاري الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
        </button>
      </form>

      <div className="card p-5">
        <h2 className="font-bold mb-3">الأقسام</h2>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="text-xs text-muted block mb-1">صورة القسم (اختياري)</label>
            <CloudinaryUpload value={newCategoryImage} onChange={setNewCategoryImage} />
          </div>
          <div className="flex gap-2">
            <input
              placeholder="اسم القسم الجديد"
              className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory} className="btn-accent rounded-lg px-4 flex items-center gap-1 text-sm shrink-0">
              <Plus className="w-4 h-4" /> إضافة
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 bg-surface2 rounded-lg px-3 py-2 text-sm">
              <button
                type="button"
                onClick={() => setEditingCategory(c)}
                className="w-9 h-9 rounded-full overflow-hidden bg-surface shrink-0 flex items-center justify-center"
                title="تعديل القسم"
              >
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted">{c.name.charAt(0)}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditingCategory(c)}
                className="flex-1 text-right"
              >
                {c.name}
              </button>
              <button onClick={() => deleteCategory(c.id)} className="text-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={saveEditCategory} className="card p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="font-bold">تعديل القسم</h2>
            <div>
              <label className="text-xs text-muted block mb-1">صورة القسم</label>
              <CloudinaryUpload
                value={editingCategory.image_url}
                onChange={(url) => setEditingCategory({ ...editingCategory, image_url: url })}
              />
            </div>
            <input
              required
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 card py-2.5 text-sm font-bold"
              >
                إلغاء
              </button>
              <button disabled={savingCategory} className="flex-1 btn-accent rounded-lg py-2.5 text-sm font-bold disabled:opacity-50">
                {savingCategory ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
