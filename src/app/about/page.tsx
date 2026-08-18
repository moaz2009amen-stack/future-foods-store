import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export const revalidate = 0;
export const metadata = { title: "من إحنا" };

export default async function AboutPage() {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <StoreHeader settings={settings} />
        <section className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-extrabold mb-4">من إحنا</h1>
          <div className="card p-6 text-sm leading-relaxed flex flex-col gap-4">
            <p>
              {settings.store_name} — {settings.store_name_en} هو متجرك الإلكتروني اللي بيوصلّك احتياجاتك اليومية من
              المجمدات والحلويات والوجبات الجاهزة وأصناف تانية كتير، من غير ما تتحرك من مكانك.
            </p>
            <p>
              هدفنا إننا نوفرلك تجربة تسوق سهلة وسريعة، بمنتجات أصلية وأسعار مناسبة، وتوصيل لباب البيت في نفس اليوم.
            </p>
            {settings.address && <p>عنواننا: {settings.address}</p>}
            {settings.phone && <p>للتواصل: {settings.phone}</p>}
            {settings.working_hours && <p>مواعيد العمل: {settings.working_hours}</p>}
          </div>
        </section>
      </div>
      <StoreFooter settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
