-- ملحوظة: الملف ده بيتضمن نفس إصلاح الأمان اللي اتبعته قبل كده في محادثة سابقة.
-- لو كنت شغّلته قبل كده، تجاهل الملف ده. لو مش متأكد، شغّله تاني بأمان —
-- كل الأوامر فيه "IF EXISTS" فمش هتسبب أي مشكلة لو الحالة موجودة بالفعل.

drop policy if exists "public insert customers" on customers;
drop policy if exists "public read own customers by phone" on customers;

create policy "staff read customers" on customers for select
  using (auth.uid() is not null);

drop policy if exists "public insert orders" on orders;
drop policy if exists "public read orders by phone" on orders;

create policy "staff read orders" on orders for select
  using (auth.uid() is not null);

drop policy if exists "public insert order_items" on order_items;
drop policy if exists "public insert invoices" on invoices;
