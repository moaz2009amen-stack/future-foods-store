-- شغّل الكود ده في Supabase SQL Editor مرة واحدة بس

alter table orders
  add column if not exists payment_method text not null default 'cash'
    check (payment_method in ('cash', 'instapay', 'wallet')),
  add column if not exists payment_proof_url text;
