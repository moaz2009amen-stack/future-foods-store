-- شغّل الكود ده في Supabase SQL Editor (New query) مرة واحدة بس
-- بيضيف صلاحية إنشاء فاتورة وقت الطلب، وبيلغي الطريقة القديمة
-- اللي كانت بتعمل الفاتورة بس لما الطلب يتحول لـ"تم التسليم"

-- 1) السماح بإنشاء فاتورة من العميل مباشرة وقت إتمام الطلب (بدون تسجيل دخول)
create policy "public insert invoices" on invoices for insert with check (true);

-- 2) إلغاء الطريقة القديمة (كانت بتعمل الفاتورة تلقائي عند "تم التسليم" بس)
drop trigger if exists trg_generate_invoice on orders;
drop function if exists generate_invoice();
