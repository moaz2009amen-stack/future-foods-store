import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export const revalidate = 0;
export const metadata = { title: "الأسئلة الشائعة" };

export default async function FAQPage() {
  const settings = await getStoreSettings();

  const faqs = [
    {
      q: "إزاي أطلب من الموقع؟",
      a: "اختار المنتجات اللي عايزها وحطها في السلة، بعدين ادخل على السلة واضغط إتمام الطلب، واكتب بياناتك واختار طريقة الدفع.",
    },
    {
      q: "هل محتاج أعمل حساب عشان أطلب؟",
      a: "لأ، تقدر تطلب مباشرة بدون تسجيل، وتتابع طلباتك بعدين برقم هاتفك بس.",
    },
    {
      q: "إمتى هيوصلني الطلب؟",
      a: settings.working_hours
        ? `بنشتغل ${settings.working_hours}، والتوصيل بياخد وقت معقول حسب منطقتك وزحمة الطلبات.`
        : "التوصيل بياخد وقت معقول حسب منطقتك وزحمة الطلبات وقت الطلب.",
    },
    {
      q: "إيه طرق الدفع المتاحة؟",
      a: "تقدر تدفع كاش عند الاستلام، أو تحويل إنستاباي، أو محفظة إلكترونية.",
    },
    {
      q: "فيه حد أدنى للطلب؟",
      a:
        settings.min_order > 0
          ? `أيوه، الحد الأدنى للطلب ${settings.min_order} ج.م.`
          : "لأ، مفيش حد أدنى للطلب حالياً.",
    },
    {
      q: "إزاي أتابع طلبي؟",
      a: 'من صفحة "تتبع طلبك" في أعلى الموقع، ادخل رقم هاتفك وهتلاقي كل طلباتك وحالتها.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <StoreHeader settings={settings} />
        <section className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-extrabold mb-6">الأسئلة الشائعة</h1>
          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => (
              <div key={i} className="card p-4">
                <h2 className="font-bold text-sm mb-1.5">{f.q}</h2>
                <p className="text-muted text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <StoreFooter settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
