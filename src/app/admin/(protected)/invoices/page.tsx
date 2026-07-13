import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, orders(order_number, customer_name, customer_phone)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">سجل الفواتير</h1>

      {!invoices || invoices.length === 0 ? (
        <p className="text-muted text-center py-16">لا توجد فواتير بعد</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm card">
            <thead>
              <tr className="text-muted text-right border-b border-border">
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">الطلب</th>
                <th className="p-3">العميل</th>
                <th className="p-3">المبيعات</th>
                <th className="p-3">الربح</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-bold">#{inv.invoice_number}</td>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="p-3">#{(inv.orders as any)?.order_number}</td>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="p-3">{(inv.orders as any)?.customer_name}</td>
                  <td className="p-3">{inv.total_sale} ج.م</td>
                  <td className="p-3 text-success font-bold">{inv.profit} ج.م</td>
                  <td className="p-3 text-muted">{new Date(inv.created_at).toLocaleDateString("ar-EG")}</td>
                  <td className="p-3">
                    <a href={`/admin/invoices/${inv.id}/print`} target="_blank" className="text-accent text-xs">طباعة</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
