"use client";

import { useState } from "react";
import type { Invoice, Order, OrderItem, StoreSettings } from "@/types";

export default function PrintInvoiceClient({
  invoice,
  order,
  items,
  settings,
}: {
  invoice: Invoice;
  order: Order | null;
  items: OrderItem[];
  settings: StoreSettings;
}) {
  const [mode, setMode] = useState<"a4" | "thermal">("a4");

  return (
    <div className="min-h-screen bg-white text-black" data-theme="red">
      <div className="print:hidden bg-bg text-text p-4 flex gap-3 justify-center">
        <button
          onClick={() => setMode("a4")}
          className={`px-4 py-2 rounded-full text-sm ${mode === "a4" ? "btn-accent" : "card"}`}
        >
          A4
        </button>
        <button
          onClick={() => setMode("thermal")}
          className={`px-4 py-2 rounded-full text-sm ${mode === "thermal" ? "btn-accent" : "card"}`}
        >
          فيش حراري 80mm
        </button>
        <button onClick={() => window.print()} className="btn-accent px-4 py-2 rounded-full text-sm font-bold">
          طباعة
        </button>
      </div>

      <div
        className={
          mode === "a4"
            ? "max-w-2xl mx-auto p-10"
            : "max-w-[80mm] mx-auto p-3 text-xs"
        }
      >
        <div className={mode === "a4" ? "text-center mb-8" : "text-center mb-3"}>
          <h1 className={mode === "a4" ? "text-2xl font-extrabold" : "font-extrabold"}>{settings.store_name}</h1>
          <p className="text-gray-500">{settings.store_name_en}</p>
          {settings.phone && <p className="text-gray-500">{settings.phone}</p>}
        </div>

        <div className={mode === "a4" ? "flex justify-between mb-6 text-sm" : "mb-2"}>
          <div>
            <p>فاتورة رقم: <b>#{invoice.invoice_number}</b></p>
            <p>طلب رقم: <b>#{order?.order_number}</b></p>
          </div>
          <div className={mode === "thermal" ? "" : "text-left"}>
            <p>{new Date(invoice.created_at).toLocaleString("ar-EG")}</p>
          </div>
        </div>

        {order && (
          <div className={mode === "a4" ? "mb-6 text-sm" : "mb-2"}>
            <p>العميل: {order.customer_name}</p>
            <p>الهاتف: {order.customer_phone}</p>
          </div>
        )}

        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-right py-1">المنتج</th>
              <th className="text-center py-1">الكمية</th>
              <th className="text-left py-1">السعر</th>
              <th className="text-left py-1">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-gray-200">
                <td className="py-1">{it.product_name}</td>
                <td className="text-center py-1">{it.quantity}</td>
                <td className="text-left py-1">{it.sale_price}</td>
                <td className="text-left py-1">{it.line_total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between font-bold border-t border-gray-400 pt-2">
          <span>الإجمالي</span>
          <span>{invoice.total_sale} ج.م</span>
        </div>

      

        <p className={mode === "a4" ? "text-center text-gray-400 text-xs mt-10" : "text-center text-gray-400 mt-3"}>
          شكراً لتعاملكم معنا
        </p>
      </div>

      <style>{`
        @media print {
          @page { size: ${mode === "a4" ? "A4" : "80mm auto"}; margin: ${mode === "a4" ? "1cm" : "2mm"}; }
        }
      `}</style>
    </div>
  );
}
