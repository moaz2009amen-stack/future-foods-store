-- شغّل الكود ده كامل في Supabase SQL Editor مرة واحدة بس

-- ============================================================
-- 1) جدول كروت الصفحة الرئيسية (أقسام رئيسية / عروض اليوم / عرض ميتفوتش / وصل حديثاً / صفقة جديدة...)
-- ============================================================
create table if not exists home_sections (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text,
  -- 'categories': كارت خاص بيعرض كل الأقسام (زي "الأقسام الرئيسية")
  -- 'products'  : كارت بيعرض منتجات معينة اختارها الأدمن (زي "عروض اليوم")
  section_type text not null default 'products' check (section_type in ('categories', 'products')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table home_sections enable row level security;

create policy "public read home_sections" on home_sections for select using (true);
create policy "staff full access home_sections" on home_sections for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table home_sections;

-- الكروت الافتراضية الخمسة (تقدر تعدلها أو تحذفها بعدين من لوحة التحكم عادي)
insert into home_sections (title, description, section_type, sort_order) values
  ('الأقسام الرئيسية', 'تصفح كل المنتجات حسب القسم', 'categories', 0),
  ('عروض اليوم', 'أقوى عروض اليوم بأسعار خاصة', 'products', 1),
  ('عرض ميتفوتش', 'عروض محدودة متفوتهاش', 'products', 2),
  ('وصل حديثاً', 'أحدث المنتجات اللي وصلت للماركت', 'products', 3),
  ('صفقة جديدة', 'صفقات جديدة كل فترة', 'products', 4);

-- ============================================================
-- 2) ربط المنتجات بالكروت + إضافة سعر الخصم
-- ============================================================
alter table products
  add column if not exists home_section_id uuid references home_sections(id) on delete set null,
  add column if not exists discount_price numeric(10,2);

-- ============================================================
-- 3) روابط السوشيال ميديا والموقع + شريط الإعلان
-- ============================================================
alter table store_settings
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists website_url text,
  add column if not exists announcement text,
  add column if not exists announcement_enabled boolean not null default false;
