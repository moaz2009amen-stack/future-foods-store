import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export const revalidate = 0;
export const metadata = { title: "سياسة الاسترجاع" };

export default async function ReturnPolicyPage() {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <StoreHeader settings={settings} />
        <section className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-extrabold mb-4">سياسة الاسترجاع والاستبدال</h1>
          <div className="card p-6 text-sm leading-relaxed flex flex-col gap-4">
            <p>
              بنحرص إن كل المنتجات توصلك بحالة ممتازة، وفي حالة وجود أي مشكلة في الطلب (منتج تالف، ناقص، أو مختلف عن
              اللي طلبته) تقدر تبلغنا خلال 24 ساعة من استلام الطلب.
            </p>
            <p>للإبلاغ عن مشكلة في طلبك:</p>
            <ul className="list-disc pr-5 flex flex-col gap-1">
              <li>كلمنا على الرقم {settings.phone || "المتاح في الموقع"} أو راسلنا على واتساب.</li>
              <li>وضّح رقم الطلب والمشكلة اللي حصلت مع صورة للمنتج لو ممكن.</li>
              <li>هنراجع طلبك ونرجعلك بأسرع وقت ممكن باستبدال المنتج أو استرجاع قيمته.</li>
            </ul>
            <p className="text-muted">
              ملحوظة: المنتجات المجمدة والمواد الغذائية سريعة التلف بيتم مراجعة طلبات الاسترجاع الخاصة بيها بحرص أكتر
              للحفاظ على سلامة الغذاء، وممكن نطلب صورة أو فيديو للمنتج وقت الاستلام.
            </p>
          </div>
        </section>
      </div>
      <StoreFooter settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
