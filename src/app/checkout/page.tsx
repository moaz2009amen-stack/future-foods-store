"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Smartphone, Wallet, Tag, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import CopyButton from "@/components/store/CopyButton";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import { trackEvent } from "@/lib/analytics";
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

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  useEffect(() => {
    if (settings) {
      trackEvent("InitiateCheckout", {
        value: total(),
        currency: "EGP",
        num_items: items.reduce((s, i) => s + i.quantity, 0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!settings]);

  const subtotal = total();
  const threshold = settings?.free_delivery_threshold;
  const freeDelivery = threshold != null && threshold > 0 && subtotal >= threshold;
  const deliveryFee = freeDelivery ? 0 : (settings?.delivery_fee ?? 0);
  const discount = appliedCoupon?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);
  const selectedOption = PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)!;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), subtotal }),
    });
    const data = await res.json();
    setCheckingCoupon(false);

    if (!res.ok) {
      setCouponError(data.error || "الكوبون غير صالح");
      return;
    }
    setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discount: data.discount });
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (settings?.min_order && subtotal < settings.min_order) {
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
        paymentMethod,
        paymentProofUrl,
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى");
      return;
    }

    const { order } = await res.json();
    trackEvent("Purchase", { value: order.total, currency: "EGP" });
    clear();
    router.push(`/track?token=${order.access_token}`);
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

        {/* كوبون الخصم */}
        <div>
          {appliedCoupon ? (
            <div className="card p-3 bg-success/10 border-success/30 flex items-center justify-between gap-2">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-success" />
                كوبون {appliedCoupon.code} — خصم {appliedCoupon.discount} ج.م
              </span>
              <button type="button" onClick={removeCoupon} className="text-danger">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                placeholder="عندك كود خصم؟"
                className="flex-1 card px-4 py-2.5 bg-transparent outline-none focus:border-accent text-sm"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={checkingCoupon || !couponInput.trim()}
                className="btn-accent rounded-lg px-4 text-sm font-bold disabled:opacity-50"
              >
                {checkingCoupon ? "جاري التحقق..." : "تطبيق"}
              </button>
            </div>
          )}
          {couponError && <p className="text-danger text-xs mt-1">{couponError}</p>}
        </div>

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

        {paymentMethod === "cash" && settings?.cash_payment_details && (
          <div className="card p-3 bg-surface2 text-sm flex items-center justify-between gap-3">
            <span>{settings.cash_payment_details}</span>
            <CopyButton value={settings.cash_payment_details} />
          </div>
        )}

        {paymentMethod === "instapay" && (settings?.instapay_account_name || settings?.instapay_number) && (
          <div className="card p-3 bg-surface2 flex flex-col gap-2 text-sm">
            <span className="text-xs text-muted font-bold">حوّل على بيانات إنستاباي دي:</span>
            {settings.instapay_account_name && (
              <div className="flex items-center justify-between gap-3">
                <span>اسم الحساب: {settings.instapay_account_name}</span>
                <CopyButton value={settings.instapay_account_name} />
              </div>
            )}
            {settings.instapay_number && (
              <div className="flex items-center justify-between gap-3" dir="ltr">
                <span className="text-right w-full">{settings.instapay_number}</span>
                <CopyButton value={settings.instapay_number} />
              </div>
            )}
          </div>
        )}

        {paymentMethod === "wallet" && (settings?.wallet_account_name || settings?.wallet_number) && (
          <div className="card p-3 bg-surface2 flex flex-col gap-2 text-sm">
            <span className="text-xs text-muted font-bold">حوّل على بيانات المحفظة دي:</span>
            {settings.wallet_account_name && (
              <div className="flex items-center justify-between gap-3">
                <span>اسم الحساب: {settings.wallet_account_name}</span>
                <CopyButton value={settings.wallet_account_name} />
              </div>
            )}
            {settings.wallet_number && (
              <div className="flex items-center justify-between gap-3" dir="ltr">
                <span className="text-right w-full">{settings.wallet_number}</span>
                <CopyButton value={settings.wallet_number} />
              </div>
            )}
          </div>
        )}

        {selectedOption.needsProof && (
          <div>
            <label className="text-xs text-muted block mb-1">
              حوّل المبلغ الإجمالي ({grandTotal} ج.م) وارفع صورة إثبات التحويل هنا
            </label>
            <CloudinaryUpload value={paymentProofUrl} onChange={setPaymentProofUrl} />
          </div>
        )}

        <div className="card p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">إجمالي المنتجات</span><span>{subtotal} ج.م</span></div>
          <div className="flex justify-between">
            <span className="text-muted">تكلفة التوصيل</span>
            <span>{freeDelivery ? <span className="text-success font-bold">مجاني</span> : `${deliveryFee} ج.م`}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>خصم الكوبون</span>
              <span>-{discount} ج.م</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>الإجمالي</span><span className="text-accent">{grandTotal} ج.م</span></div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button disabled={loading} className="btn-accent rounded-full py-3 font-bold disabled:opacity-50">
          {loading ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      </form>

      <WhatsAppButton whatsappNumber={settings?.whatsapp_number ?? null} />
    </div>
  );
}
