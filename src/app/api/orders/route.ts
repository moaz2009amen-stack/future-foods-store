import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, address, notes, items, deliveryFee, paymentMethod, paymentProofUrl } = body;

  if (!name || !phone || !address || !items?.length) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const validPaymentMethods = ["cash", "instapay", "wallet"];
  const finalPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : "cash";

  const supabase = await createClient();

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

  // نجيب بيانات المنتجات (سعر البيع الحقيقي وسعر الشراء) من قاعدة البيانات
  // ولا نثق ببيانات الأسعار القادمة من المتصفح، حماية من التلاعب وتسريب سعر الشراء
  const productIds = items.map((i: { id: string }) => i.id);
  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, name, sale_price, purchase_price, discount_price")
    .in("id", productIds);

  const priceMap = new Map((dbProducts || []).map((p) => [p.id, p]));

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

  const itemsTotal = resolvedItems.reduce((sum: number, i: ResolvedItem) => sum + i.line_total, 0);
  const total = itemsTotal + (deliveryFee || 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: name,
      customer_phone: phone,
      address,
      notes: notes || null,
      delivery_fee: deliveryFee || 0,
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

  // الفاتورة بتتعمل فوراً وقت ما الطلب بيتسجل، مش لما يتحول لـ"تم التسليم"
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
