-- بيرجع صف الإعدادات بالقيم الافتراضية (لو محذوف بالكامل)
insert into store_settings (id)
values (1)
on conflict (id) do nothing;
