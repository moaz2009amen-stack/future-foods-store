import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";

export const revalidate = 0;

export default async function ProductsAdminPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return <ProductsClient initialProducts={products ?? []} categories={categories ?? []} />;
}
