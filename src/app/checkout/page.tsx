"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Smartphone, Wallet } from "lucide-react";
import { useCartStore } from "@/store/cart";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import type { StoreSettings, PaymentMethod } from "@/types";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote; needsProof: boolean }[] = [
  { value: "cash", label: "كاش عند الاستلام", icon: Banknote, needsProof: false },
  { value: "instapay", label: "إنستاباي", icon: Smartphone, needsProof: true },
  { value: "wallet", label: "محفظة إلكترونية", icon: Wallet, needsProof: true },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCartStore();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const deliveryFee = settings?.delivery_fee ?? 0;
  const grandTotal = total() + deliveryFee;
  const selectedOption = PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (settings?.min_order && total() < settings.min_order) {
      setError(`الحد الأدنى للطلب هو ${settings.min_order} ج.م`);
      return;
    }

    if (selectedOption.needsProof && !paymentProofUrl) {
      setError("لازم ترفع صورة إثبات التحويل قبل إرسال الطلب");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        deliveryFee,
        paymentMethod,
        paymentProofUrl,
        items: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      setError("حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى");
      return;
    }

    const { order } = await res.json();
    clear();
    router.push(`/track?phone=${encodeURIComponent(form.phone)}&order=${order.order_number}`);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-muted">
        السلة فارغة، أضف منتجات أولاً
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="الاسم"
          className="card px-4 py-3 bg-transparent outline-none focus:border-accent"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="tel"
          placeholder="رقم الهاتف"
          className="card px-4 py-3 bg-transparent outline-none focus:border-accent"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <textarea
          required
          placeholder="العنوان بالتفصيل"
          rows={3}
          className="card px-4 py-3 bg-transparent outline-none focus:border-accent"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <textarea
          placeholder="ملاحظات (اختياري)"
          rows={2}
          className="card px-4 py-3 bg-transparent outline-none focus:border-accent"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div>
          <label className="text-xs text-muted block mb-2">طريقة الدفع</label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  setPaymentMethod(opt.value);
                  if (!opt.needsProof) setPaymentProofUrl(null);
                }}
                className={`card p-3 flex flex-col items-center gap-1 text-xs font-bold border-2 ${
                  paymentMethod === opt.value ? "border-accent" : "border-transparent"
                }`}
              >
                <opt.icon className="w-5 h-5" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {selectedOption.needsProof && (
          <div>
            <label className="text-xs text-muted block mb-1">
              حوّل المبلغ الإجمالي ({grandTotal} ج.م) وارفع صورة إثبات التحويل هنا
            </label>
            <CloudinaryUpload value={paymentProofUrl} onChange={setPaymentProofUrl} />
          </div>
        )}

        <div className="card p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">إجمالي المنتجات</span><span>{total()} ج.م</span></div>
          <div className="flex justify-between"><span className="text-muted">تكلفة التوصيل</span><span>{deliveryFee} ج.م</span></div>
          <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>الإجمالي</span><span className="text-accent">{grandTotal} ج.م</span></div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button disabled={loading} className="btn-accent rounded-full py-3 font-bold disabled:opacity-50">
          {loading ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      </form>
    </div>
  );
}