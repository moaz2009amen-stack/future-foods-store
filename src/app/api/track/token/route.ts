import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// بديل آمن عن تمرير رقم الهاتف في الرابط بعد إتمام الطلب مباشرة.
// التوكن ده عشوائي غير قابل للتخمين ومرتبط بطلب واحد بس، فحتى لو
// اتشارك اللينك بالغلط (سكرين شوت، واتساب...) محدش يقدر يشوف غير
// الطلب ده بس، مش كل تاريخ طلبات العميل زي ما كان بيحصل قبل كده.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "توكن غير صحيح" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, customer_phone")
    .eq("access_token", token)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  const [{ data: items }, { data: reviews }] = await Promise.all([
    supabase.from("order_items").select("product_id, product_name").eq("order_id", order.id),
    supabase.from("reviews").select("product_id").eq("order_id", order.id),
  ]);

  const reviewedSet = new Set((reviews ?? []).map((r) => r.product_id));

  return NextResponse.json({
    order: {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      // رقم الهاتف بيرجع هنا بس عشان نعبّي حقل البحث تلقائياً للعميل
      // نفسه في نفس الجلسة، مش لأي حد تاني يقدر يوصله من غير التوكن
      customer_phone: order.customer_phone,
      items: (items ?? []).map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        reviewed: it.product_id ? reviewedSet.has(it.product_id) : true,
      })),
    },
  });
}
