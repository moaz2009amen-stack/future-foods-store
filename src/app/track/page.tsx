"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABELS, type Order } from "@/types";

function TrackContent() {
  const params = useSearchParams();
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(p: string) {
    if (!p) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", p)
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (params.get("phone")) search(params.get("phone")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {loading && <p className="text-muted">جاري البحث...</p>}

      {orders && orders.length === 0 && (
        <p className="text-muted text-center">لا توجد طلبات بهذا الرقم</p>
      )}

      <div className="flex flex-col gap-3">
        {orders?.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">طلب #{o.order_number}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[o.status]}`}>
                {ORDER_STATUS_LABELS[o.status]}
              </span>
            </div>
            <div className="text-sm text-muted flex justify-between">
              <span>{new Date(o.created_at).toLocaleString("ar-EG")}</span>
              <span className="font-bold text-text">{o.total} ج.م</span>
            </div>
          </div>
        ))}
      </div>
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
