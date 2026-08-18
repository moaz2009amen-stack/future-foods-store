# سر السعادة ستور (Future Foods Store)

## 0) تحديث مهم — دفعة جديدة كبيرة

لو المشروع شغال عندك بالفعل من قبل، لازم تشغّل ملفات الـ SQL دي **بالترتيب** في
Supabase → SQL Editor → New query قبل ما تشغّل الكود الجديد:

1. `supabase/migration_security_reminder.sql` (لو مسبق شغلته في محادثة سابقة، تجاهله)
2. `supabase/migration_batch3_full.sql` — **الأهم** — ده بيضيف:
   - روابط SEO تلقائية للمنتجات (slug)
   - تفاصيل منتج إضافية (وزن، مكونات، بلد المنشأ، صلاحية)
   - إعدادات التتبع (Meta Pixel، GA4)، واتساب، وحد التوصيل المجاني
   - جدول الكوبونات
   - جدول التقييمات

بعد تشغيل الملفين، كمّل خطوات التشغيل العادية تحت.

---

## 1) تجهيز Supabase

1. مشروع Supabase جديد → **SQL Editor** → شغّل `supabase/migration_batch3_full.sql` (ولو
   أول مرة، لازم قبله كمان ملف الـ schema الأساسي من النسخة الأولى).
2. من **Project Settings → API**: `NEXT_PUBLIC_SUPABASE_URL`، `NEXT_PUBLIC_SUPABASE_ANON_KEY`،
   و`SUPABASE_SERVICE_ROLE_KEY` (سري جداً).

### أول مستخدم Owner
من Supabase Authentication → Add user (بريد بالشكل `اسمك@store.local`)، وفعّل Auto Confirm.
بعدين من SQL Editor:
```sql
insert into app_users (id, username, role)
select id, 'moaz', 'owner' from auth.users where email = 'moaz@store.local';
```

## 2) Cloudinary
Cloud name + Upload preset (Unsigned) من إعدادات الرفع.

## 3) التشغيل محلياً
```bash
npm install
cp .env.local.example .env.local
```
املأ القيم في `.env.local`، وضيف كمان:
```
NEXT_PUBLIC_SITE_URL=https://future-foods-store.vercel.app
```
(غيّرها لدومينك الحقيقي بعد ما تشتريه)

```bash
npm run dev
```

## 4) رفع Vercel
نفس خطوات النسخة الأولى — ضيف كل المتغيرات في Environment Variables.

---

## 5) دليل الميزات الجديدة (لصاحب المتجر)

من `/admin/settings`:
- **رقم واتساب**: بالصيغة الدولية بدون + (مثال: `201012345678`) — بيظهر زرار عائم في كل صفحة.
- **حد التوصيل المجاني**: سيبه فاضي لو مش عايز الميزة.
- **Meta Pixel ID و GA4 Measurement ID**: من Business Manager وGoogle Analytics.
- **بيانات حسابات الدفع**: تظهر للعميل مع زرار نسخ وقت اختيار طريقة الدفع.

من `/admin/products`: حقول اختيارية جديدة (الوزن، المكونات، بلد المنشأ، الصلاحية) تظهر في صفحة المنتج لو اتملت.

من `/admin/coupons` (Owner بس): إنشاء أكواد خصم (نسبة أو مبلغ ثابت، حد أدنى، حد استخدام، تاريخ انتهاء).

**التقييمات**: تلقائية — العميل بيقدر يقيّم المنتجات من صفحة "تتبع طلبك" بعد ما الطلب يوصل لحالة "تم التسليم".

**الصفحات الثابتة**: `/about`، `/faq`، `/return-policy`، `/privacy-policy` — نصوص جاهزة، روابطها في الفوتر.

---

## 6) ملاحظة عن روابط المنتجات
روابط المنتجات اتغيرت من `/product/[id]` إلى `/product/[slug]` (رابط أوضح بالاسم بدل رقم عشوائي).
ده بيتولد تلقائياً لكل منتج (قديم أو جديد) من قاعدة البيانات، مفيش حاجة تعملها يدوي.

## 7) إصلاحات فحص أمني (دفعة جديدة)

شغّل `supabase/migration_security_fixes_v2.sql` في SQL Editor — بيضيف:
- دالة آمنة لزيادة استخدام الكوبون (تمنع تلاعب متزامن)
- عمود `access_token` لكل طلب (رابط تتبع آمن بعد الطلب مباشرة بدل كشف رقم الهاتف)

**لو لسه بتواجه مشكلة "صفحة مش موجودة" عند الدخول على منتج:**
```sql
select id, name, slug from products where slug is null or slug = '';
```
لو رجعت نتائج، شغّل `migration_batch3_full.sql` تاني كامل — ده معناه إنه ماتنفذش من الأول، أو
إن الموقع متصل بمشروع Supabase مختلف عن اللي شغّلت عليه المهاجرات. تأكد إن
`NEXT_PUBLIC_SUPABASE_URL` في `.env.local` وفي Vercel Environment Variables بيشيروا لنفس المشروع بالظبط.

