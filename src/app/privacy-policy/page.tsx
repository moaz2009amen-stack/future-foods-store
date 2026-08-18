import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export const revalidate = 0;
export const metadata = { title: "سياسة الخصوصية" };

export default async function PrivacyPolicyPage() {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <StoreHeader settings={settings} />
        <section className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-extrabold mb-4">سياسة الخصوصية</h1>
          <div className="card p-6 text-sm leading-relaxed flex flex-col gap-4">
            <p>
              خصوصيتك مهمة بالنسبة لنا. بنجمع بس البيانات اللازمة لإتمام طلبك بنجاح: الاسم، رقم الهاتف، والعنوان،
              وبنستخدمها فقط لتوصيل طلبك والتواصل معاك بخصوصه.
            </p>
            <p>مبنشاركش بياناتك مع أي طرف تالت غير شركات التوصيل اللي بتنفذ الطلب نفسه.</p>
            <p>
              بنستخدم أدوات تحليل زي Google Analytics وFacebook Pixel لفهم أداء الموقع وتحسين تجربة التسوق، وده بيتم
              بشكل مجمّع وغير مرتبط باسمك الشخصي.
            </p>
            <p>لو عندك أي استفسار عن بياناتك أو عايز نحذفها، تواصل معانا على {settings.phone || "أرقامنا في الموقع"}.</p>
          </div>
        </section>
      </div>
      <StoreFooter settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
