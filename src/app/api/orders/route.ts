import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MIN_SECONDS_BETWEEN_ORDERS = 60;

function isValidEgyptianPhone(phone: string): boolean {
  return /^01[0125][0-9]{8}$/.test(phone);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, address, notes, items, paymentMethod, paymentProofUrl, couponCode } = body;

  if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  if (!isValidEgyptianPhone(String(phone))) {
    return NextResponse.json({ error: "رقم الهاتف غير صحيح" }, { status: 400 });
  }

  if (items.length > 100) {
    return NextResponse.json({ error: "عدد المنتجات في الطلب كبير جداً" }, { status: 400 });
  }
  const hasInvalidItem = items.some(
    (i: { id?: unknown; quantity?: unknown }) =>
      typeof i.id !== "string" ||
      typeof i.quantity !== "number" ||
      !Number.isFinite(i.quantity) ||
      i.quantity <= 0 ||
      i.quantity > 100
  );
  if (hasInvalidItem) {
    return NextResponse.json({ error: "بيانات المنتجات غير صحيحة" }, { status: 400 });
  }

  const validPaymentMethods = ["cash", "instapay", "wallet"];
  const finalPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : "cash";

  const supabase = createAdminClient();

  // ── حماية من السبام ──
  const { data: lastOrder } = await supabase
    .from("orders")
    .select("created_at")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastOrder) {
    const secondsSinceLastOrder = (Date.now() - new Date(lastOrder.created_at).getTime()) / 1000;
    if (secondsSinceLastOrder < MIN_SECONDS_BETWEEN_ORDERS) {
      const waitSeconds = Math.ceil(MIN_SECONDS_BETWEEN_ORDERS - secondsSinceLastOrder);
      return NextResponse.json(
        { error: `تم إرسال طلب من نفس الرقم منذ لحظات، من فضلك انتظر ${waitSeconds} ثانية وحاول تاني` },
        { status: 429 }
      );
    }
  }

  // إنشاء أو استخدام عميل موجود بنفس الرقم
  let customerId: string | null = null;
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer } = await supabase
      .from("customers")
      .insert({ name, phone, address })
      .select("id")
      .single();
    customerId = newCustomer?.id ?? null;
  }

  // أسعار وحالة توفر المنتجات من قاعدة البيانات مباشرة، مش من المتصفح
  const productIds = items.map((i: { id: string }) => i.id);
  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, name, sale_price, purchase_price, discount_price, status")
    .in("id", productIds);

  const priceMap = new Map((dbProducts || []).map((p) => [p.id, p]));

  // لو أي منتج بقى "غير متوفر" بعد ما العميل ضافه للسلة (تغيير من الأدمن
  // في نفس الوقت مثلاً)، نرفض الطلب كله بدل ما نسجله ناقص من غير توضيح
  const unavailableItem = items.find((i: { id: string }) => {
    const p = priceMap.get(i.id);
    return p && p.status !== "available";
  });
  if (unavailableItem) {
    const p = priceMap.get(unavailableItem.id);
    return NextResponse.json(
      { error: `عذراً، المنتج "${p?.name ?? ""}" غير متوفر حالياً` },
      { status: 400 }
    );
  }

  interface ResolvedItem {
    product_id: string;
    product_name: string;
    quantity: number;
    sale_price: number;
    purchase_price: number;
    line_total: number;
  }

  const resolvedItems: ResolvedItem[] = items.map(
    (i: { id: string; quantity: number }) => {
      const p = priceMap.get(i.id);
      const basePrice = p?.sale_price ?? 0;
      const discount = p?.discount_price;
      const effectivePrice =
        discount != null && discount > 0 && discount < basePrice ? discount : basePrice;
      return {
        product_id: i.id,
        product_name: p?.name ?? "منتج",
        quantity: i.quantity,
        sale_price: effectivePrice,
        purchase_price: p?.purchase_price ?? 0,
        line_total: effectivePrice * i.quantity,
      };
    }
  );

  const hasUnknownProduct = resolvedItems.some((i) => !priceMap.has(i.product_id));
  if (hasUnknownProduct) {
    return NextResponse.json({ error: "بعض المنتجات غير متاحة" }, { status: 400 });
  }

  const itemsTotal = resolvedItems.reduce((sum: number, i: ResolvedItem) => sum + i.line_total, 0);

  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();
  const baseDeliveryFee = settings?.delivery_fee ?? 0;
  const threshold = settings?.free_delivery_threshold;
  const freeDelivery = threshold != null && threshold > 0 && itemsTotal >= threshold;
  const deliveryFee = freeDelivery ? 0 : baseDeliveryFee;

  // التحقق من الكوبون وزيادة استخدامه بعملية atomic تمنع التلاعب المتزامن
  let discountAmount = 0;
  let finalCouponCode: string | null = null;

  if (couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", couponCode)
      .eq("is_active", true)
      .maybeSingle();

    if (coupon) {
      const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
      const meetsMinOrder = itemsTotal >= coupon.min_order;

      if (notExpired && meetsMinOrder) {
        const { data: increased } = await supabase.rpc("increment_coupon_usage", { coupon_id: coupon.id });

        if (increased) {
          discountAmount =
            coupon.type === "percentage"
              ? Math.round((itemsTotal * coupon.value) / 100)
              : Math.min(coupon.value, itemsTotal);
          finalCouponCode = coupon.code;
        }
      }
    }
  }

  const total = Math.max(0, itemsTotal + deliveryFee - discountAmount);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: name,
      customer_phone: phone,
      address,
      notes: notes || null,
      delivery_fee: deliveryFee,
      coupon_code: finalCouponCode,
      discount_amount: discountAmount,
      total,
      payment_method: finalPaymentMethod,
      payment_proof_url: finalPaymentMethod === "cash" ? null : (paymentProofUrl || null),
    })
    .select("*")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "تعذر إنشاء الطلب" }, { status: 500 });
  }

  await supabase.from("order_items").insert(
    resolvedItems.map((i) => ({ ...i, order_id: order.id }))
  );

  const totalPurchase = resolvedItems.reduce(
    (sum, i) => sum + i.purchase_price * i.quantity,
    0
  );
  await supabase.from("invoices").insert({
    order_id: order.id,
    total_sale: total,
    total_purchase: totalPurchase,
    profit: total - totalPurchase,
  });

  return NextResponse.json({ order });
}
