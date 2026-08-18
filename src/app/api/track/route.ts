import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// حماية بسيطة من محاولات البحث المتكررة (Brute-force على أرقام الهواتف)
// ملحوظة: التخزين في الذاكرة بيتصفر مع كل إعادة نشر على Vercel، وده
// كافي كحد أدنى للحماية من إساءة استخدام سريعة، مش بديل كامل عن
// خدمة Rate Limiting مخصصة لو الموقع كبر واحتاج حماية أقوى
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function isValidEgyptianPhone(phone: string): boolean {
  return /^01[0125][0-9]{8}$/.test(phone);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!phone) {
    return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });
  }

  if (!isValidEgyptianPhone(phone)) {
    return NextResponse.json({ error: "رقم الهاتف غير صحيح" }, { status: 400 });
  }

  if (isRateLimited(`track:${ip}`)) {
    return NextResponse.json(
      { error: "محاولات كتير في وقت قصير، حاول تاني بعد شوية" },
      { status: 429 }
    );
  }

  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "تعذر البحث عن الطلبات" }, { status: 500 });
  }

  const orderIds = (orders ?? []).map((o) => o.id);

  const [{ data: items }, { data: reviews }] = await Promise.all([
    orderIds.length
      ? supabase.from("order_items").select("order_id, product_id, product_name").in("order_id", orderIds)
      : Promise.resolve({ data: [] }),
    orderIds.length
      ? supabase.from("reviews").select("order_id, product_id").in("order_id", orderIds)
      : Promise.resolve({ data: [] }),
  ]);

  const reviewedSet = new Set((reviews ?? []).map((r) => `${r.order_id}-${r.product_id}`));

  const result = (orders ?? []).map((o) => ({
    ...o,
    items: (items ?? [])
      .filter((it) => it.order_id === o.id)
      .map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        reviewed: it.product_id ? reviewedSet.has(`${o.id}-${it.product_id}`) : true,
      })),
  }));

  return NextResponse.json({ orders: result });
}
