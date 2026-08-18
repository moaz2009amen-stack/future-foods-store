import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS } from "@/types";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: newCount },
    { count: preparingCount },
    { count: deliveredCount },
    { count: cancelledCount },
    { data: allOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "preparing"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("orders").select("total, created_at").eq("status", "delivered"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const { data: invoices } = await supabase.from("invoices").select("profit, created_at");

  const totalSales = (allOrders ?? []).reduce((s, o) => s + Number(o.total), 0);
  const totalProfit = (invoices ?? []).reduce((s, i) => s + Number(i.profit), 0);

  const today = new Date().toDateString();
  const monthStart = new Date();
  monthStart.setDate(1);

  const profitToday = (invoices ?? [])
    .filter((i) => new Date(i.created_at).toDateString() === today)
    .reduce((s, i) => s + Number(i.profit), 0);
  const profitMonth = (invoices ?? [])
    .filter((i) => new Date(i.created_at) >= monthStart)
    .reduce((s, i) => s + Number(i.profit), 0);

  const { data: topProductsRaw } = await supabase
    .from("order_items")
    .select("product_name, quantity");

  const topMap = new Map<string, number>();
  (topProductsRaw ?? []).forEach((i) => {
    topMap.set(i.product_name, (topMap.get(i.product_name) ?? 0) + i.quantity);
  });
  const topProducts = Array.from(topMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const cards = [
    { label: "طلبات جديدة", value: newCount ?? 0 },
    { label: "جاري التجهيز", value: preparingCount ?? 0 },
    { label: "طلبات مكتملة", value: deliveredCount ?? 0 },
    { label: "طلبات ملغاة", value: cancelledCount ?? 0 },
    { label: "إجمالي المبيعات", value: `${totalSales} ج.م` },
    { label: "إجمالي الأرباح", value: `${totalProfit} ج.م` },
    { label: "أرباح اليوم", value: `${profitToday} ج.م` },
    { label: "أرباح الشهر", value: `${profitMonth} ج.م` },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">لوحة المعلومات</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="text-2xl font-extrabold text-accent">{c.value}</div>
            <div className="text-xs text-muted mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-bold mb-3">أكثر المنتجات طلباً</h2>
          {topProducts.length === 0 ? (
            <p className="text-muted text-sm">لا توجد بيانات بعد</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {topProducts.map(([name, qty]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="text-accent font-bold">{qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-bold mb-3">أحدث الطلبات</h2>
          {(recentOrders ?? []).length === 0 ? (
            <p className="text-muted text-sm">لا توجد طلبات بعد</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {recentOrders!.map((o) => (
                <li key={o.id} className="flex justify-between">
                  <span>#{o.order_number} — {o.customer_name}</span>
                  <span className="text-muted">{ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
