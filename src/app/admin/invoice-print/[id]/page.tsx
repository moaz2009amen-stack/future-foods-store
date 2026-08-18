import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import PrintInvoiceClient from "./PrintInvoiceClient";

export const revalidate = 0;

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: appUser } = await supabase.from("app_users").select("*").eq("id", user.id).single();
  if (!appUser || !appUser.active) redirect("/admin/login");

  const settings = await getStoreSettings();

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single();
  if (!invoice) notFound();

  const { data: order } = await supabase.from("orders").select("*").eq("id", invoice.order_id).single();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", invoice.order_id);

  return (
    <PrintInvoiceClient
      invoice={invoice}
      order={order}
      items={items ?? []}
      settings={settings}
    />
  );
}
