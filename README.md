# سر السعادة ستور (Future Foods Store)

متجر إلكتروني كامل لبيع المنتجات الغذائية، مبني بـ Next.js وSupabase، مع لوحة تحكم إدارية شاملة.

## المميزات

**للعملاء**
- تصفح المنتجات حسب الفئات والأقسام
- صفحة منتج بتفاصيل موسّعة (الوزن، المكونات، بلد المنشأ، تاريخ الصلاحية)
- سلة شراء وصفحة دفع (Checkout)
- تتبّع الطلب برابط آمن بعد إتمام الطلب
- تقييم المنتجات بعد استلام الطلب
- كوبونات خصم (نسبة أو مبلغ ثابت)
- زر واتساب عائم للتواصل المباشر
- دعم PWA (قابل للتثبيت على الجهاز)

**للإدارة (`/admin`)**
- لوحة تحكم (Dashboard) وتقارير
- إدارة المنتجات، الفئات، وأقسام الصفحة الرئيسية
- إدارة الطلبات والفواتير (مع طباعة فاتورة)
- إدارة الكوبونات (خاص بدور Owner)
- إدارة المستخدمين والصلاحيات
- إعدادات عامة: بيانات واتساب، حد التوصيل المجاني، تتبع (Meta Pixel وGA4)، بيانات حسابات الدفع

## التقنيات المستخدمة

- [Next.js 14](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) لقاعدة البيانات، المصادقة، وSQL
- [Zustand](https://zustand-demo.pmnd.rs/) لإدارة الحالة
- [Cloudinary](https://cloudinary.com/) لرفع واستضافة الصور

## الإعداد والتشغيل

### 1) قاعدة البيانات (Supabase)

أنشئ مشروع Supabase جديد، وشغّل ملفات الـ SQL الموجودة في مجلد `supabase/` بالترتيب التالي من **SQL Editor**:

1. `schema.sql` — السكيما الأساسية
2. باقي ملفات `migration_*.sql` بالترتيب الزمني حسب اسمها
3. `migration_security_fixes_v2.sql` — إصلاحات أمنية (دالة آمنة لاستخدام الكوبونات، رابط تتبع طلب آمن)

من **Project Settings → API** هتحتاج:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (سري — متتحطش في الفرونت اند أو تتعمله commit)

### 2) أول مستخدم Owner

من Supabase → Authentication → Add user (بريد بالشكل `name@store.local`، مع تفعيل Auto Confirm)، بعدين من SQL Editor:

```sql
insert into app_users (id, username, role)
select id, 'username', 'owner' from auth.users where email = 'name@store.local';
```

### 3) Cloudinary

هتحتاج Cloud name وUpload preset (Unsigned) من إعدادات الحساب.

### 4) التشغيل محليًا

```bash
npm install
cp .env.local.example .env.local
```

املأ القيم في `.env.local`، وضيف:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

```bash
npm run dev
```

### 5) النشر على Vercel

ارفع المتغيرات البيئية كلها في **Environment Variables**، وتأكد إن `NEXT_PUBLIC_SUPABASE_URL` بتشاور على نفس مشروع Supabase اللي شغّلت عليه المهاجرات.

## ملاحظات

- روابط المنتجات بصيغة `/product/[slug]` (بالاسم، مش رقم) وبتتولد تلقائيًا من قاعدة البيانات لكل منتج.
- الصفحات الثابتة (`/about`, `/faq`, `/return-policy`, `/privacy-policy`) موجودة وروابطها في الفوتر.

## الترخيص

هذا المشروع ملكية خاصة (Proprietary). جميع الحقوق محفوظة، وغير مرخّص للاستخدام أو النسخ أو التعديل العام. راجع ملف [LICENSE](./LICENSE) للتفاصيل.