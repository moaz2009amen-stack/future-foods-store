import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/types";

const PUBLIC_COLUMNS = "id,name,description,image_url,category_id,home_section_id,sale_price,discount_price,status,is_featured";

/**
 * بيقترح منتجات مشابهة بترتيب ذكي:
 * 1) منتجات اتباعت فعلياً مع نفس المنتج في نفس الطلبات (الأكثر تكراراً الأول)
 * 2) لو مكملتش العدد المطلوب، بيكمل من نفس القسم
 * 3) لو لسه ناقص، بيكمل بأحدث المنتجات المتاحة عموماً
 */
export async function getSimilarProducts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const results: Product[] = [];
  const excludeIds = new Set<string>([productId]);

  // 1) المنتجات اللي بتتباع مع نفس المنتج
  const { data: sameOrderItems } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("product_id", productId);

  const orderIds = (sameOrderItems ?? []).map((r: { order_id: string }) => r.order_id);

  if (orderIds.length > 0) {
    const { data: coItems } = await supabase
      .from("order_items")
      .select("product_id")
      .in("order_id", orderIds)
      .neq("product_id", productId);

    const counts = new Map<string, number>();
    (coItems ?? []).forEach((r: { product_id: string | null }) => {
      if (!r.product_id) return;
      counts.set(r.product_id, (counts.get(r.product_id) ?? 0) + 1);
    });

    const topIds = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pid]) => pid)
      .slice(0, limit);

    if (topIds.length > 0) {
      const { data: coProducts } = await supabase
        .from("products")
        .select(PUBLIC_COLUMNS)
        .in("id", topIds)
        .eq("status", "available");

      (coProducts as Product[] | null)?.forEach((p) => {
        if (!excludeIds.has(p.id) && results.length < limit) {
          results.push(p);
          excludeIds.add(p.id);
        }
      });
    }
  }

  // 2) استكمال من نفس القسم لو لسه ناقص
  if (results.length < limit && categoryId) {
    const { data: categoryProducts } = await supabase
      .from("products")
      .select(PUBLIC_COLUMNS)
      .eq("category_id", categoryId)
      .eq("status", "available")
      .limit(limit + excludeIds.size);

    (categoryProducts as Product[] | null)?.forEach((p) => {
      if (!excludeIds.has(p.id) && results.length < limit) {
        results.push(p);
        excludeIds.add(p.id);
      }
    });
  }

  // 3) استكمال بأحدث المنتجات المتاحة لو لسه ناقص
  if (results.length < limit) {
    const { data: latestProducts } = await supabase
      .from("products")
      .select(PUBLIC_COLUMNS)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(limit + excludeIds.size);

    (latestProducts as Product[] | null)?.forEach((p) => {
      if (!excludeIds.has(p.id) && results.length < limit) {
        results.push(p);
        excludeIds.add(p.id);
      }
    });
  }

  return results;
}
