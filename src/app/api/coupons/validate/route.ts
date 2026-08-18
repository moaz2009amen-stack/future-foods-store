import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json();

  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (!coupon) {
    return NextResponse.json({ error: "الكوبون مش موجود أو غير مفعّل" }, { status: 400 });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: "الكوبون منتهي الصلاحية" }, { status: 400 });
  }

  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: "الكوبون وصل للحد الأقصى من الاستخدام" }, { status: 400 });
  }

  if (subtotal < coupon.min_order) {
    return NextResponse.json(
      { error: `الكوبون ده يتطلب حد أدنى للطلب ${coupon.min_order} ج.م` },
      { status: 400 }
    );
  }

  const discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return NextResponse.json({ discount });
}
