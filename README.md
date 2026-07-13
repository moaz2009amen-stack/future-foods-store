# سر السعادة ستور (Future Foods Store)

نظام إدارة طلبات ماركت متكامل — موقع عملاء + لوحة تحكم.

**التقنيات:** Next.js 14 · Supabase (قاعدة بيانات + مصادقة + Realtime) · Cloudinary (صور) · Vercel (استضافة)

---

## 0) تحديث مهم قبل ما تبدأ (لو عندك قاعدة بيانات شغالة بالفعل)

لو دي أول مرة، اتجاهل الخطوة دي وابدأ من "1) تجهيز Supabase" تحت.

لو عندك مشروع Supabase شغال بالفعل من قبل، افتح **SQL Editor → New query** وشغّل ملف
`supabase/migration_invoice_on_order.sql` (مرة واحدة بس) عشان الفاتورة تبقى بتتعمل
أول ما الطلب يتسجل بدل ما تستنى لحد "تم التسليم".

---

## 1) تجهيز Supabase

1. افتح supabase.com واعمل مشروع جديد (اختر باسورد قوي لقاعدة البيانات واحتفظ بيه).
2. من القائمة الجانبية: **SQL Editor** → **New query**.
3. افتح ملف `supabase/schema.sql` من المشروع، انسخ محتواه كامل، الصقه، واضغط **Run**.
   - هيتنشئ كل الجداول + الصلاحيات (RLS) + تفعيل Realtime على جدول الطلبات تلقائياً.
4. من **Project Settings → API** هتلاقي:
   - `Project URL` → ده `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → ده `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` (تحت "Reveal") → ده `SUPABASE_SERVICE_ROLE_KEY` — سري جداً، متشاركوش مع حد ولا ترفعه على GitHub

### إنشاء أول مستخدم Owner
النظام مصمم إنك تنشئ باقي المستخدمين من داخل لوحة التحكم (صفحة المستخدمين)، لكن أول Owner لازم يتعمل يدوياً:

1. من Supabase: **Authentication → Users → Add user** → حط إيميل بالشكل ده بالظبط: `اسمك@store.local` (مثال: moaz@store.local) وحط كلمة مرور. فعّل "Auto Confirm User".
2. من **SQL Editor** شغّل الاستعلام ده (غيّر القيم حسب اسمك):

```sql
insert into app_users (id, username, role)
select id, 'moaz', 'owner' from auth.users where email = 'moaz@store.local';
```

3. دلوقتي تقدر تسجل دخول في `/admin/login` باسم المستخدم `moaz` وكلمة المرور اللي حطيتها.

---

## 2) تجهيز Cloudinary

1. سجّل في cloudinary.com (فيه باقة مجانية كافية جداً للبداية).
2. من الـ Dashboard انسخ **Cloud name** → ده `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
3. روح **Settings → Upload → Upload presets → Add upload preset**:
   - Signing Mode: اختار **Unsigned**
   - احفظ، وانسخ اسم الـ preset → ده `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---

## 3) تشغيل المشروع محلياً

```bash
cd future-foods-store
npm install
cp .env.local.example .env.local
```

افتح `.env.local` واملأ القيم الخمسة اللي جمعتها فوق، بعدين:

```bash
npm run dev
```

- موقع العملاء: http://localhost:3000
- لوحة التحكم: http://localhost:3000/admin/login

---

## 4) رفع المشروع على Vercel

1. ارفع المشروع على GitHub (تأكد إن `.env.local` مش متضمن — موجود في `.gitignore` بالفعل).
2. من vercel.com → **Add New Project** → اختر الريبو.
3. في **Environment Variables** ضيف نفس المتغيرات الخمسة من `.env.local`.
4. Deploy. هتاخد رابط زي future-foods-store.vercel.app (ده الدومين المجاني المؤقت).
5. لما تشتري دومين، تقدر تضيفه من **Project Settings → Domains**.

---

## 5) ملاحظات مهمة

- **التنبيه الصوتي**: أول ما أي عامل يفتح `/admin/orders` أو أي صفحة في لوحة التحكم، هيلاقي زرار "فعّل صوت تنبيهات الطلبات" — لازم يضغطه مرة واحدة (قيد من المتصفح نفسه، مش من التطبيق) وبعدها الصوت هيشتغل تلقائي مع أي طلب جديد ويتكرر لحد ما يضغط "تم الاستلام".
- **الأقسام**: بتتضاف من `/admin/settings` (Owner بس).
- **الثيم**: أحمر ثابت بتصميم دافئ وحيوي (اتشال الثيم الأسود نهائياً).
- **بانر الصفحة الرئيسية**: ارفعه من `/admin/settings` (حقل "صورة البانر الرئيسي").
- **الفواتير**: بتتعمل تلقائي أول ما تحول حالة أي طلب لـ"تم التسليم"، وتقدر تطبعها A4 أو فيش حراري من صفحة الفواتير.
- **حماية سعر الشراء**: سعر الشراء بيتحسب من السيرفر مباشرة ومحدش من العملاء يقدر يشوفه أو يتلاعب فيه.

---

## 6) هيكل المشروع (أهم الملفات)

```
supabase/schema.sql          → قاعدة البيانات كاملة
src/app/(customer pages)     → الرئيسية، تفاصيل منتج، السلة، إتمام الطلب، تتبع الطلبات
src/app/admin/               → لوحة التحكم (دخول، طلبات، منتجات، فواتير، مستخدمين، إعدادات)
src/app/api/                 → orders (إنشاء طلب)، admin/users (إدارة المستخدمين)، settings
src/components/store/        → مكونات موقع العملاء
src/components/admin/        → مكونات لوحة التحكم (رفع الصور، الصوت، القائمة الجانبية)
src/store/cart.ts            → سلة التسوق (تُحفظ في المتصفح)
```

## ما لسه ناقص / اقتراحات للمرحلة الجاية
- إشعارات WhatsApp للأدمن عند وصول طلب — لو حبيت نضيفها تاني قولّي.
- أيقونة PWA الحالية بسيطة (SVG مولّدة بالكود) — لو عندك شعار جاهز حاب تستخدمه كأيقونة تثبيت الموقع، ابعتهولي وأستبدلها.

## آخر إضافات
- **PWA**: الموقع بقى قابل للتثبيت على الموبايل (Add to Home Screen) عن طريق `manifest.json` و Service Worker بسيط.
- **منتجات مشابهة أذكى**: بتعتمد دلوقتي على المنتجات اللي بتتباع فعلياً مع بعض في نفس الطلبات، مش بس نفس القسم.
- **تقارير**: صفحة `/admin/reports` (Owner بس) بتدّيك مبيعات وأرباح وأكتر منتجات مبيعاً بأي فترة تاريخ تختارها.
- **الملف الشخصي**: `/admin/profile` — كل مستخدم يقدر يغير اسمه وكلمة مروره بنفسه.
- **صفحات 404 وخطأ مخصصة** بهوية الموقع.
