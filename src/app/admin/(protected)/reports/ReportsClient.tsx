"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Skeleton from "@/components/admin/Skeleton";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types";

interface ReportData {
  totalSales: number;
  totalProfit: number;
  ordersCount: number;
  statusCounts: Record<OrderStatus, number>;
  topProducts: { name: string; qty: number }[];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStartStr() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export default function ReportsClient() {
  const [from, setFrom] = useState(monthStartStr());
  const [to, setTo] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  async function runReport() {
    setLoading(true);
    const supabase = createClient();

    const fromDate = new Date(from + "T00:00:00").toISOString();
    const toDate = new Date(to + "T23:59:59").toISOString();

    const { data: orders } = await supabase
      .from("orders")
      .select("id, status, total, created_at")
      .gte("created_at", fromDate)
      .lte("created_at", toDate);

    const { data: invoices } = await supabase
      .from("invoices")
      .select("profit, created_at")
      .gte("created_at", fromDate)
      .lte("created_at", toDate);

    const orderIds = (orders ?? []).map((o) => o.id);
    let topProducts: { name: string; qty: number }[] = [];

    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity, order_id")
        .in("order_id", orderIds);

      const counts = new Map<string, number>();
      (items ?? []).forEach((i) => {
        counts.set(i.product_name, (counts.get(i.product_name) ?? 0) + i.quantity);
      });
      topProducts = Array.from(counts.entries())
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 8);
    }

    const statusCounts: Record<OrderStatus, number> = {
      new: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };
    (orders ?? []).forEach((o) => {
      statusCounts[o.status as OrderStatus] = (statusCounts[o.status as OrderStatus] ?? 0) + 1;
    });

    setReport({
      totalSales: (orders ?? []).reduce((s, o) => s + Number(o.total), 0),
      totalProfit: (invoices ?? []).reduce((s, i) => s + Number(i.profit), 0),
      ordersCount: (orders ?? []).length,
      statusCounts,
      topProducts,
    });
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">التقارير</h1>

      <div className="card p-4 flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="text-xs text-muted block mb-1">من تاريخ</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">إلى تاريخ</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={runReport}
          disabled={loading}
          className="btn-accent rounded-lg px-5 py-2 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          {loading ? "جاري التحميل..." : "عرض التقرير"}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {!loading && report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card p-4">
              <div className="text-2xl font-extrabold text-accent">{report.totalSales} ج.م</div>
              <div className="text-xs text-muted mt-1">إجمالي المبيعات</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-extrabold text-accent">{report.totalProfit} ج.م</div>
              <div className="text-xs text-muted mt-1">إجمالي الأرباح</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-extrabold text-accent">{report.ordersCount}</div>
              <div className="text-xs text-muted mt-1">عدد الطلبات</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-extrabold text-accent">{report.statusCounts.delivered}</div>
              <div className="text-xs text-muted mt-1">طلبات مكتملة</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-4">
              <h2 className="font-bold mb-3">حالات الطلبات في الفترة</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {(Object.keys(report.statusCounts) as OrderStatus[]).map((s) => (
                  <li key={s} className="flex justify-between">
                    <span>{ORDER_STATUS_LABELS[s]}</span>
                    <span className="font-bold text-accent">{report.statusCounts[s]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-4">
              <h2 className="font-bold mb-3">الأكثر مبيعاً في الفترة</h2>
              {report.topProducts.length === 0 ? (
                <p className="text-muted text-sm">لا توجد بيانات في الفترة دي</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {report.topProducts.map((p) => (
                    <li key={p.name} className="flex justify-between">
                      <span>{p.name}</span>
                      <span className="text-accent font-bold">{p.qty}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
