-- شغّل الكود ده في Supabase SQL Editor مرة واحدة بس

-- يحدث القيمة الحالية لو كانت لسه على أحمر
update store_settings set theme = 'white' where theme <> 'white';

-- يخلي الأبيض هو القيمة الافتراضية لأي صف جديد مستقبلاً
alter table store_settings alter column theme set default 'white';

-- يمنع أي قيمة تانية غير الأبيض (الأحمر والأسود القديمين اتلغوا خالص)
alter table store_settings drop constraint if exists store_settings_theme_check;
alter table store_settings add constraint store_settings_theme_check
  check (theme = 'white');
