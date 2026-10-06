-- متجر بطاطا: الكوبونات + تنبيهات التوفر
-- الصق الملف كاملًا في Supabase > SQL Editor > New query ثم Run

-- ========== الكوبونات ==========
create table if not exists public.coupons (
  code        text primary key,
  percent     numeric not null check (percent > 0 and percent <= 100),
  active      boolean not null default true,
  max_uses    integer,
  used_count  integer not null default 0,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.coupons enable row level security;

drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons
  for all to authenticated
  using ((select auth.jwt() ->> 'email') in (select email from public.admin_users))
  with check ((select auth.jwt() ->> 'email') in (select email from public.admin_users));

insert into public.coupons (code, percent) values ('BATATA10', 10)
on conflict (code) do nothing;

-- الزائر يتحقق من الكود فقط (ما يقدر يقرأ الجدول)
create or replace function public.validate_coupon(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare c public.coupons;
begin
  select * into c from public.coupons
   where upper(code) = upper(trim(p_code))
     and active
     and (expires_at is null or expires_at > now())
     and (max_uses is null or used_count < max_uses);
  if not found then
    return jsonb_build_object('valid', false);
  end if;
  return jsonb_build_object('valid', true, 'code', c.code, 'percent', c.percent);
end;
$$;
revoke all on function public.validate_coupon(text) from public;
grant execute on function public.validate_coupon(text) to anon, authenticated;

-- ========== أعلمني عند التوفر ==========
create table if not exists public.stock_alerts (
  id          bigint generated always as identity primary key,
  product_id  text not null,
  email       text not null,
  created_at  timestamptz not null default now(),
  notified_at timestamptz,
  unique (product_id, email)
);
alter table public.stock_alerts enable row level security;

drop policy if exists "admins manage stock alerts" on public.stock_alerts;
create policy "admins manage stock alerts" on public.stock_alerts
  for all to authenticated
  using ((select auth.jwt() ->> 'email') in (select email from public.admin_users))
  with check ((select auth.jwt() ->> 'email') in (select email from public.admin_users));

create or replace function public.subscribe_stock_alert(p_product_id text, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;
  insert into public.stock_alerts (product_id, email)
  values (p_product_id, lower(trim(p_email)))
  on conflict (product_id, email) do update set notified_at = null;
end;
$$;
revoke all on function public.subscribe_stock_alert(text, text) from public;
grant execute on function public.subscribe_stock_alert(text, text) to anon, authenticated;
