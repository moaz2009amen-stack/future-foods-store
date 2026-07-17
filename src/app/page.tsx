import Link from "next/link";
import { Truck, ShieldCheck, BadgePercent, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import HomeSectionCard from "@/components/store/HomeSectionCard";
import type { HomeSection } from "@/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const { data: sections } = await supabase
    .from("home_sections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <StoreHeader settings={settings} />

      {settings.announcement_enabled && settings.announcement && (
        <AnnouncementBar text={settings.announcement} />
      )}

      {/* البانر الرئيسي */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="card hero-gradient p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 overflow-hidden relative">
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
              تجربة تسوق <span className="bg-gradient-to-l from-accent to-accent-2 bg-clip-text text-transparent">أسهل وأسرع</span>
            </h1>
            <p className="text-muted mb-6">منتجات مختارة بعناية من أجلك، توصيل سريع وجودة مضمونة</p>
            <Link href="#departments" className="btn-accent inline-block rounded-full px-6 py-3 font-bold">
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
            { icon: Truck, title: "توصيل سريع", desc: "خلال ساعات", color: "text-accent" },
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

      {/* كروت أقسام الماركت الكبيرة - كل كارت زي "قسم" في الماركت الحقيقي */}
      <section id="departments" className="max-w-7xl mx-auto px-4 mt-10 mb-16">
        <h2 className="text-lg font-bold mb-4">اتفسح في الماركت</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {(sections as HomeSection[] | null)?.map((section) => (
            <HomeSectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      <StoreFooter settings={settings} />
    </div>
  );
}
