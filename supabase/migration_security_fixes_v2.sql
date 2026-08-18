-- ══════════════════════════════════════════════════════════════
-- إصلاحات الفحص الأمني — شغّله كامل مرة واحدة في SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── 1) تذكير بالتحقق من مشكلة الـ slug (السبب الجذري لمشكلة 404) ──
-- شغّل السطر ده وشوف: لو slug فاضي لأي منتج يبقى المشكلة هنا
-- select id, name, slug from products where slug is null or slug = '';
-- لو ظهرت نتائج، معناها migration_batch3_full.sql ماتنفذش على
-- نفس قاعدة البيانات المتصلة بالموقع الحي — شغّله تاني كامل.

-- ── 2) دالة آمنة لزيادة استخدام الكوبون (تمنع Race Condition) ──
-- الفرق عن الطريقة القديمة: القراءة والتحديث بيحصلوا في عملية
-- واحدة atomic بدل ما يبقوا خطوتين منفصلتين ممكن يتزاحموا مع بعض
create or replace function increment_coupon_usage(coupon_id uuid)
returns boolean as $$
declare
  updated_rows int;
begin
  update coupons
  set used_count = used_count + 1
  where id = coupon_id
    and (max_uses is null or used_count < max_uses);

  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$ language plpgsql security definer;

grant execute on function increment_coupon_usage to service_role;

-- ── 3) توكن آمن لكل طلب (بديل عن كشف رقم الهاتف في الرابط) ──
alter table orders add column if not exists access_token uuid default gen_random_uuid();
create unique index if not exists idx_orders_access_token on orders(access_token);
