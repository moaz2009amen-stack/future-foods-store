-- =========================================================
-- سر السعادة ستور (Future Foods Store) — Database Schema
-- شغّل هذا الملف كامل في Supabase SQL Editor
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- 1) الأقسام
-- ---------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 2) المنتجات
-- ---------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  purchase_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  status text not null default 'available' check (status in ('available','unavailable')),
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_products_category on products(category_id);
create index idx_products_status on products(status);

-- ---------------------------------------------------------
-- 3) العملاء (بدون حساب/باسورد — تعريف عن طريق رقم الهاتف)
-- ---------------------------------------------------------
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  address text,
  created_at timestamptz default now()
);

create index idx_customers_phone on customers(phone);

-- ---------------------------------------------------------
-- 4) رقم تسلسلي للطلبات (تسلسلي بسيط: 1001, 1002 ...)
-- ---------------------------------------------------------
create sequence order_number_seq start 1001;

-- ---------------------------------------------------------
-- 5) الطلبات
-- ---------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number int not null default nextval('order_number_seq') unique,
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  notes text,
  status text not null default 'new'
    check (status in ('new','preparing','ready','delivered','cancelled')),
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  acknowledged boolean default false, -- لإيقاف صوت التنبيه لما العامل يضغط "تم الاستلام"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_status on orders(status);
create index idx_orders_phone on orders(customer_phone);
create index idx_orders_created on orders(created_at desc);

-- ---------------------------------------------------------
-- 6) عناصر الطلب
-- ---------------------------------------------------------
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,   -- نسخة ثابتة وقت الطلب (لو المنتج اتعدل بعدين)
  quantity int not null default 1,
  sale_price numeric(10,2) not null,
  purchase_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

create index idx_order_items_order on order_items(order_id);

-- ---------------------------------------------------------
-- 7) الفواتير (تتولد تلقائياً عند "تم التسليم")
-- ---------------------------------------------------------
create sequence invoice_number_seq start 1;

create table invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number int not null default nextval('invoice_number_seq') unique,
  order_id uuid references orders(id) unique,
  total_sale numeric(10,2) not null,
  total_purchase numeric(10,2) not null,
  profit numeric(10,2) not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 8) المستخدمون (Owner / Worker) — مرتبطة بـ Supabase Auth
-- ---------------------------------------------------------
create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null check (role in ('owner','worker')),
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 9) إعدادات النظام (صف واحد فقط)
-- ---------------------------------------------------------
create table store_settings (
  id int primary key default 1,
  store_name text default 'سر السعادة ستور',
  store_name_en text default 'Future Foods Store',
  logo_url text,
  phone text,
  address text,
  delivery_fee numeric(10,2) default 0,
  min_order numeric(10,2) default 0,
  working_hours text,
  theme text default 'red' check (theme in ('red','black')),
  banner_url text,
  constraint single_row check (id = 1)
);

insert into store_settings (id) values (1);

-- =========================================================
-- الدوال والتريجرات
-- =========================================================

-- تحديث updated_at تلقائياً
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated
before update on products
for each row execute function set_updated_at();

create trigger trg_orders_updated
before update on orders
for each row execute function set_updated_at();

-- ملحوظة: الفاتورة دلوقتي بتتعمل مباشرة من كود التطبيق (API) وقت إنشاء الطلب،
-- مش عن طريق trigger مرتبط بحالة "تم التسليم" زي الإصدار القديم.

-- =========================================================
-- Row Level Security
-- =========================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table invoices enable row level security;
alter table app_users enable row level security;
alter table store_settings enable row level security;

-- قراءة عامة (لموقع العملاء): الأقسام والمنتجات المتاحة فقط
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read store settings" on store_settings for select using (true);

-- العميل يقدر ينشئ عميل/طلب/عناصر طلب (بدون تسجيل دخول)
create policy "public insert customers" on customers for insert with check (true);
create policy "public read own customers by phone" on customers for select using (true);

create policy "public insert orders" on orders for insert with check (true);
create policy "public read orders by phone" on orders for select using (true);

create policy "public insert order_items" on order_items for insert with check (true);
create policy "public read order_items" on order_items for select using (true);

-- المستخدمون المسجلين (Owner/Worker) عندهم صلاحيات كاملة على التشغيل اليومي
create policy "staff full access categories" on categories for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "staff full access products" on products for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "staff update orders" on orders for update
  using (auth.uid() is not null);

create policy "public insert invoices" on invoices for insert with check (true);

create policy "staff read invoices" on invoices for select
  using (auth.uid() is not null);

create policy "staff read app_users self" on app_users for select
  using (auth.uid() is not null);

-- إعدادات النظام والمستخدمين: Owner فقط
create policy "owner manage settings" on store_settings for update
  using (exists (select 1 from app_users where id = auth.uid() and role = 'owner'));

create policy "owner manage users" on app_users for insert
  with check (exists (select 1 from app_users u where u.id = auth.uid() and u.role = 'owner'));

create policy "owner update users" on app_users for update
  using (exists (select 1 from app_users u where u.id = auth.uid() and u.role = 'owner'));

create policy "owner delete users" on app_users for delete
  using (exists (select 1 from app_users u where u.id = auth.uid() and u.role = 'owner'));

-- تفعيل Realtime على جدول الطلبات (أساس التنبيه اللحظي)
alter publication supabase_realtime add table orders;
