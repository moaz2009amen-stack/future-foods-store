import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import type { Category } from "@/types";

export const revalidate = 0;

export default async function CategoriesPage() {
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
      <StoreHeader settings={settings} />
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">الأقسام الرئيسية</h1>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(categories as Category[]).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="card overflow-hidden group flex flex-col"
              >
                <div className="aspect-video bg-surface2 overflow-hidden">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-2xl font-bold">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3 font-bold text-center">{cat.name}</div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center py-16">لا توجد أقسام حالياً</p>
        )}
      </section>
      </div>
      <StoreFooter settings={settings} />
    </div>
  );
}