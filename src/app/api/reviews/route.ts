import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { orderId, productId, phone, rating, comment } = await req.json();

  if (!orderId || !productId || !phone || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // التحقق إن الطلب موجود، تم تسليمه فعلاً، وإن رقم الهاتف مطابق لصاحب الطلب
  // (ده اللي بيضمن إن التقييم من عميل اشترى المنتج فعلاً مش أي حد)
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_name, customer_phone, status")
    .eq("id", orderId)
    .single();

  if (!order || order.customer_phone !== phone || order.status !== "delivered") {
    return NextResponse.json({ error: "غير مسموح بتقييم هذا الطلب" }, { status: 403 });
  }

  // التأكد إن المنتج ده فعلاً كان جوه الطلب
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!orderItem) {
    return NextResponse.json({ error: "المنتج ده مش جزء من الطلب" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      order_id: orderId,
      product_id: productId,
      customer_name: order.customer_name,
      customer_phone: phone,
      rating,
      comment: comment || null,
    },
    { onConflict: "order_id,product_id" }
  );

  if (error) {
    return NextResponse.json({ error: "تعذر حفظ التقييم" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
