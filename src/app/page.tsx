import Link from "next/link";
import { Truck, ShieldCheck, BadgePercent, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import type { Category, Product } from "@/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const [{ data: categories }, { data: featured }, { data: latest }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("id,name,description,image_url,category_id,sale_price,status,is_featured").eq("is_featured", true).eq("status", "available").limit(8),
    supabase.from("products").select("id,name,description,image_url,category_id,sale_price,status,is_featured").order("created_at", { ascending: false }).limit(8),
  ]);

  return (
    <div>
      <StoreHeader settings={settings} />

      {/* البانر الرئيسي */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="card hero-gradient p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 overflow-hidden relative">
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
              تجربة تسوق <span className="bg-gradient-to-l from-accent to-accent-2 bg-clip-text text-transparent">أسهل وأسرع</span>
            </h1>
            <p className="text-muted mb-6">منتجات مختارة بعناية من أجلك، توصيل سريع وجودة مضمونة</p>
            <Link href="#categories" className="btn-accent inline-block rounded-full px-6 py-3 font-bold">
              تسوق الآن
            </Link>
          </div>
          {settings.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.banner_url} alt="بانر" className="flex-1 max-w-sm rounded-2xl object-cover" />
          )}
        </div>

        {/* مميزات الماركت */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: Truck, title: "توصيل سريع", desc: "خلال دقائق", color: "text-accent" },
            { icon: ShieldCheck, title: "دفع آمن", desc: "طرق دفع متعددة", color: "text-accent-2" },
            { icon: Award, title: "جودة مضمونة", desc: "منتجات أصلية", color: "text-accent" },
            { icon: BadgePercent, title: "عروض حصرية", desc: "خصومات يومية", color: "text-accent-2" },
          ].map((f, i) => (
            <div key={i} className="card p-3 flex items-center gap-2">
              <f.icon className={`w-6 h-6 shrink-0 ${f.color}`} />
              <div>
                <div className="text-sm font-bold">{f.title}</div>
                <div className="text-[11px] text-muted">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* الأقسام */}
      <section id="categories" className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-lg font-bold mb-4">تسوق حسب الأقسام</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {(categories as Category[] | null)?.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center group-hover:border-accent transition-colors">
                {cat.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted">{cat.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* المنتجات المميزة */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <h2 className="text-lg font-bold mb-4">المنتجات المميزة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(featured as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* أحدث المنتجات */}
      <section className="max-w-7xl mx-auto px-4 mt-10 mb-16">
        <h2 className="text-lg font-bold mb-4">أحدث المنتجات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(latest as Product[] | null)?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <StoreFooter settings={settings} />
    </div>
  );
}
