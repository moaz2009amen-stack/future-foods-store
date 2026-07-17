-- شغّل الكود ده في Supabase SQL Editor مرة واحدة بس
-- بيسمح بقيمة 'white' للثيم الجديد بدل 'black' القديمة

alter table store_settings drop constraint if exists store_settings_theme_check;
alter table store_settings add constraint store_settings_theme_check
  check (theme in ('red', 'white'));
