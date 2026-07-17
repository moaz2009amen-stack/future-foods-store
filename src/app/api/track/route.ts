import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim();

  if (!phone) {
    return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // مطابقة تامة برقم الهاتف بس، مش بحث عام، عشان محدش يقدر يسحب طلبات غيره
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "تعذر البحث عن الطلبات" }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}