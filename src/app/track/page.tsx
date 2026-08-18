"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types";
import RatingStars from "@/components/store/RatingStars";
import WhatsAppButton from "@/components/store/WhatsAppButton";

interface TrackedItem {
  product_id: string | null;
  product_name: string;
  quantity?: number;
  reviewed: boolean;
}

interface TrackedOrder {
  id: string;
  order_number: number;
  status: OrderStatus;
  total: number;
  created_at: string;
  items: TrackedItem[];
}

function TrackContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((s) => setWhatsapp(s.whatsapp_number));
  }, []);

  async function search(p: string) {
    if (!p) return;
    setLoading(true);
    const res = await fetch(`/api/track?phone=${encodeURIComponent(p)}`);
    const data = await res.json();
    if (!res.ok) {
      setOrders([]);
      setNotice(data.error || "تعذر البحث");
    } else {
      setOrders(data.orders);
      setNotice("");
    }
    setLoading(false);
  }

  // لو جاي من صفحة إتمام الطلب مباشرة، بنجيب الطلب ده بس عن طريق
  // توكن آمن خاص بيه، مش برقم الهاتف كامل مكشوف في الرابط — ده بيمنع
  // إن أي حد يشارك اللينك ده بالغلط ويكشف كل تاريخ طلبات العميل
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/track/token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setPhone(data.order.customer_phone);
          setOrders([data.order]);
        } else {
          setNotice("الطلب غير موجود");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function submitReview(orderId: string, productId: string) {
    const draft = ratingDrafts[`${orderId}-${productId}`];
    if (!draft || draft.rating === 0) return;

    const key = `${orderId}-${productId}`;
    setSubmitting(key);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        productId,
        phone,
        rating: draft.rating,
        comment: draft.comment,
      }),
    });
    setSubmitting(null);

    if (res.ok) {
      if (token) {
        fetch(`/api/track/token?token=${encodeURIComponent(token)}`)
          .then((r) => r.json())
          .then((data) => data.order && setOrders([data.order]));
      } else {
        search(phone);
      }
    }
  }

  const statusColor: Record<string, string> = {
    new: "bg-warning/20 text-warning",
    preparing: "bg-accent/20 text-accent",
    ready: "bg-success/20 text-success",
    delivered: "bg-success/30 text-success",
    cancelled: "bg-danger/20 text-danger",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6">تتبع طلباتك</h1>

      {!token && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(phone);
          }}
          className="flex gap-2 mb-8"
        >
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ادخل رقم الهاتف"
            className="flex-1 card px-4 py-3 bg-transparent outline-none focus:border-accent"
          />
          <button className="btn-accent rounded-full px-6 font-bold">بحث</button>
        </form>
      )}

      {loading && <p className="text-muted">جاري البحث...</p>}

      {notice && <p className="text-danger text-sm text-center mb-4">{notice}</p>}

      {orders && orders.length === 0 && !notice && (
        <p className="text-muted text-center">لا توجد طلبات بهذا الرقم</p>
      )}

      <div className="flex flex-col gap-4">
        {orders?.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">طلب #{o.order_number}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[o.status]}`}>
                {ORDER_STATUS_LABELS[o.status]}
              </span>
            </div>
            <div className="text-sm text-muted flex justify-between mb-3">
              <span>{new Date(o.created_at).toLocaleString("ar-EG")}</span>
              <span className="font-bold text-text">{o.total} ج.م</span>
            </div>

            {o.status === "delivered" && o.items.length > 0 && (
              <div className="border-t border-border pt-3 flex flex-col gap-3">
                <span className="text-xs text-muted font-bold">قيّم المنتجات اللي طلبتها</span>
                {o.items.map((it) => {
                  if (!it.product_id) return null;
                  const key = `${o.id}-${it.product_id}`;

                  if (it.reviewed) {
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{it.product_name}</span>
                        <span className="text-success text-xs font-bold">تم التقييم ✓</span>
                      </div>
                    );
                  }

                  const draft = ratingDrafts[key] ?? { rating: 0, comment: "" };

                  return (
                    <div key={key} className="bg-surface2 rounded-lg p-3 flex flex-col gap-2">
                      <span className="text-sm font-bold">{it.product_name}</span>
                      <RatingStars
                        value={draft.rating}
                        onChange={(v) =>
                          setRatingDrafts((prev) => ({ ...prev, [key]: { ...draft, rating: v } }))
                        }
                        size="w-6 h-6"
                      />
                      <input
                        placeholder="تعليق (اختياري)"
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm"
                        value={draft.comment}
                        onChange={(e) =>
                          setRatingDrafts((prev) => ({ ...prev, [key]: { ...draft, comment: e.target.value } }))
                        }
                      />
                      <button
                        disabled={draft.rating === 0 || submitting === key}
                        onClick={() => submitReview(o.id, it.product_id!)}
                        className="btn-accent rounded-lg py-2 text-sm font-bold disabled:opacity-50 w-fit px-4 self-end"
                      >
                        {submitting === key ? "جاري الإرسال..." : "إرسال التقييم"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <WhatsAppButton whatsappNumber={whatsapp} />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
