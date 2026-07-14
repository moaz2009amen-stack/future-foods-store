"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order, type OrderItem, type OrderStatus } from "@/types";
import { Bell, CheckCircle2, Truck, XCircle } from "lucide-react";
import Skeleton from "@/components/admin/Skeleton";

const STATUS_OPTIONS: OrderStatus[] = ["new", "preparing", "ready", "delivered", "cancelled"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-warning/20 text-warning",
  preparing: "bg-accent/20 text-accent",
  ready: "bg-success/20 text-success",
  delivered: "bg-success/30 text-success",
  cancelled: "bg-danger/20 text-danger",
};

type OrderWithItems = Order & { order_items: OrderItem[] };

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setOrders((data as OrderWithItems[]) ?? []);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("orders-admin-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdatingId(id);
    const supabase = createClient();

    // تحديث فوري في الواجهة (Optimistic) عشان تحس بالاستجابة على طول
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);

    setUpdatingId(null);

    if (error) {
      alert("تعذر تحديث حالة الطلب: " + error.message);
      // نرجع الحالة القديمة لو فشل التحديث فعلياً في قاعدة البيانات
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      setOrders((data as OrderWithItems[]) ?? []);
    }
  }

  async function acknowledge(id: string) {
    const supabase = createClient();
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, acknowledged: true } : o)));
    const { error } = await supabase.from("orders").update({ acknowledged: true }).eq("id", id);
    if (error) alert("تعذر تأكيد الاستلام: " + error.message);
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">إدارة الطلبات</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm ${filter === "all" ? "btn-accent" : "card text-muted"}`}
        >
          الكل
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === s ? "btn-accent" : "card text-muted"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="w-40 h-4 mb-3" />
              <Skeleton className="w-full h-3 mb-2" />
              <Skeleton className="w-2/3 h-3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-center py-16">لا توجد طلبات</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o) => (
            <div key={o.id} className={`card p-4 ${!o.acknowledged ? "border-danger" : ""}`}>
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    طلب #{o.order_number}
                    {!o.acknowledged && <Bell className="w-4 h-4 text-danger" />}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {new Date(o.created_at).toLocaleString("ar-EG")}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="text-muted">العميل: </span>{o.customer_name}</div>
                <div><span className="text-muted">الهاتف: </span>{o.customer_phone}</div>
                <div className="sm:col-span-2"><span className="text-muted">العنوان: </span>{o.address}</div>
                {o.notes && <div className="sm:col-span-2"><span className="text-muted">ملاحظات: </span>{o.notes}</div>}
                <div><span className="text-muted">طريقة الدفع: </span>{PAYMENT_METHOD_LABELS[o.payment_method]}</div>
                <div><span className="text-muted">تكلفة التوصيل: </span>{o.delivery_fee} ج.م</div>
              </div>

              <div className="bg-surface2 rounded-lg p-3 mb-3">
                <div className="text-xs text-muted mb-2">المنتجات المطلوبة</div>
                {o.order_items && o.order_items.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 text-sm">
                    {o.order_items.map((it) => (
                      <li key={it.id} className="flex justify-between">
                        <span>{it.product_name} <span className="text-muted">× {it.quantity}</span></span>
                        <span className="font-bold">{it.line_total} ج.م</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-sm">مفيش تفاصيل منتجات لهذا الطلب</p>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-border mt-2 pt-2">
                  <span>الإجمالي</span>
                  <span className="text-accent">{o.total} ج.م</span>
                </div>
              </div>

              {o.payment_proof_url && (
                <div className="mb-3">
                  <span className="text-muted text-sm block mb-1">صورة إثبات التحويل:</span>
                  <a href={o.payment_proof_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.payment_proof_url}
                      alt="إثبات التحويل"
                      className="w-28 h-28 object-cover rounded-lg border border-border"
                    />
                  </a>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {!o.acknowledged && (
                  <button
                    onClick={() => acknowledge(o.id)}
                    className="btn-accent rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تم الاستلام (إيقاف التنبيه)
                  </button>
                )}

                {/* أزرار سريعة واضحة لأكثر حالتين بيتغيروا كتير */}
                {o.status !== "delivered" && o.status !== "cancelled" && (
                  <button
                    disabled={updatingId === o.id}
                    onClick={() => updateStatus(o.id, "delivered")}
                    className="rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1 bg-success text-white disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4" />
                    تم التسليم
                  </button>
                )}
                {o.status !== "cancelled" && o.status !== "delivered" && (
                  <button
                    disabled={updatingId === o.id}
                    onClick={() => updateStatus(o.id, "cancelled")}
                    className="rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1 bg-danger text-white disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    إلغاء الطلب
                  </button>
                )}

                <select
                  disabled={updatingId === o.id}
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                  className="card px-3 py-2 text-sm bg-surface2 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}