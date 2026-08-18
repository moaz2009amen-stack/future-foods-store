-- 1) شغّل ده الأول للتشخيص: هيوريلك أي منتجات عندها slug فاضي
select id, name, slug from products where slug is null or slug = '';

-- 2) لو ظهرلك نتائج فوق، شغّل السطر ده لإصلاحها فوراً
-- (نفس منطق التريجر بالظبط، بيولّد slug من الاسم + جزء من الـ id)
update products
set slug = trim(both '-' from regexp_replace(
              regexp_replace(lower(name), '[^a-z0-9\u0600-\u06FF ]+', '', 'g'),
              '\s+', '-', 'g'
            )) || '-' || substr(id::text, 1, 8)
where slug is null or slug = '';

-- 3) تأكد إن التريجر نفسه موجود وشغال (عشان أي منتج جديد ياخد slug تلقائي)
select tgname from pg_trigger where tgname = 'trg_set_product_slug';
-- لو السطر ده رجع فاضي (مفيش نتيجة)، يبقى التريجر مش موجود ولازم تشغّل
-- migration_batch3_full.sql كامل تاني من الأول
