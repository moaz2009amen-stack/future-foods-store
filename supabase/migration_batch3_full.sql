-- ══════════════════════════════════════════════════════════════
-- Migration الدفعة الجديدة — شغّله كامل مرة واحدة في SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── 1) روابط SEO للمنتجات (slug تلقائي، محدش محتاج يعمل حاجة يدوي) ──
alter table products add column if not exists slug text;

create or replace function set_product_slug()
returns trigger as $$
begin
  if new.slug is null or new.slug = ''
     or (tg_op = 'UPDATE' and new.name is distinct from old.name and new.slug = old.slug) then
    new.slug := trim(both '-' from regexp_replace(
                  regexp_replace(lower(new.name), '[^a-z0-9\u0600-\u06FF ]+', '', 'g'),
                  '\s+', '-', 'g'
                )) || '-' || substr(new.id::text, 1, 8);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_product_slug on products;
create trigger trg_set_product_slug
before insert or update on products
for each row execute function set_product_slug();

-- تعبئة الـ slug للمنتجات الموجودة بالفعل
update products
set slug = trim(both '-' from regexp_replace(
              regexp_replace(lower(name), '[^a-z0-9\u0600-\u06FF ]+', '', 'g'),
              '\s+', '-', 'g'
            )) || '-' || substr(id::text, 1, 8)
where slug is null or slug = '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_slug_key') then
    alter table products add constraint products_slug_key unique (slug);
  end if;
end $$;

create index if not exists idx_products_slug on products(slug);

-- ── 2) تفاصيل منتج إضافية (اختيارية) ──
alter table products add column if not exists weight text;
alter table products add column if not exists ingredients text;
alter table products add column if not exists origin_country text;
alter table products add column if not exists shelf_life text;

-- ── 3) إعدادات تتبع، واتساب، توصيل مجاني ──
alter table store_settings add column if not exists meta_pixel_id text;
alter table store_settings add column if not exists ga4_measurement_id text;
alter table store_settings add column if not exists whatsapp_number text;
alter table store_settings add column if not exists free_delivery_threshold numeric(10,2);

-- ── 4) خصم الكوبون على الطلب ──
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount_amount numeric(10,2) not null default 0;

-- ── 5) جدول الكوبونات ──
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  type text not null default 'percentage' check (type in ('percentage', 'fixed')),
  value numeric(10,2) not null default 0,
  min_order numeric(10,2) not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table coupons enable row level security;
-- مفيش صلاحية قراءة عامة عمداً — التحقق من الكوبون بيتم بس عن طريق API آمن
-- من السيرفر، عشان محدش يقدر يسحب كل الأكواد مباشرة من قاعدة البيانات
create policy "owner manage coupons" on coupons for all
  using (exists (select 1 from app_users u where u.id = auth.uid() and u.role = 'owner'))
  with check (exists (select 1 from app_users u where u.id = auth.uid() and u.role = 'owner'));

-- ── 6) جدول التقييمات ──
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_visible boolean not null default true,
  created_at timestamptz default now(),
  unique (order_id, product_id)
);

create index if not exists idx_reviews_product on reviews(product_id);

alter table reviews enable row level security;
create policy "public read visible reviews" on reviews for select using (is_visible = true);
-- الإدخال بيتم بس عن طريق API آمن بيتحقق إن الطلب فعلاً "تم التسليم"
-- وإن رقم الهاتف مطابق، فمفيش صلاحية إدخال عامة مباشرة هنا

create policy "staff manage reviews" on reviews for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
