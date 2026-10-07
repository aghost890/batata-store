-- متجر بطاطا: إصلاحات الأمان (الصق الملف كاملًا في SQL Editor ثم Run)

-- 1) دالة تتحقق أن المستخدم أدمن (من جدول admin_users)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2) صلاحيات الكتابة: للأدمن فقط (كانت لأي مستخدم مسجّل دخول)
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- إنشاء الطلبات صار من السيرفر فقط (دالة الدفع)، فنقفل الإضافة المباشرة
drop policy if exists "public insert orders" on public.orders;

drop policy if exists "authenticated can write settings" on public.site_settings;
drop policy if exists "admin write settings" on public.site_settings;
create policy "admin write settings" on public.site_settings
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- قائمة الأدمن ما تنقرأ من الزوار
drop policy if exists "anyone can check admin emails" on public.admin_users;

drop policy if exists "admins can manage stock" on public.account_stock;
create policy "admins can manage stock" on public.account_stock
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admins manage stock alerts" on public.stock_alerts;
create policy "admins manage stock alerts" on public.stock_alerts
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 3) أعداد المخزون بدالة بدل الـ view (يعرض الأعداد فقط، بدون بيانات حسابات)
create or replace function public.stock_count(p_product_id text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (select 1 from public.account_stock where product_id::text = p_product_id)
    then (select count(*)::integer from public.account_stock where product_id::text = p_product_id and status = 'available')
    else null
  end;
$$;
revoke all on function public.stock_count(text) from public;
grant execute on function public.stock_count(text) to anon, authenticated;

create or replace function public.stock_counts()
returns table (product_id text, available_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select s.product_id::text, (count(*) filter (where s.status = 'available'))::integer
  from public.account_stock s
  group by s.product_id;
$$;
revoke all on function public.stock_counts() from public, anon;
grant execute on function public.stock_counts() to authenticated;

-- 4) الأكثر مبيعًا (يشتغل للزوار بدون ما نفتح جدول الطلبات)
create or replace function public.best_seller_ids(p_limit integer default 3)
returns table (product_id text)
language sql
stable
security definer
set search_path = public
as $$
  select i ->> 'productId' as product_id
  from public.orders o, jsonb_array_elements(o.items::jsonb) i
  where o.status = 'مكتمل' and (i ->> 'productId') is not null
  group by 1
  order by sum(coalesce((i ->> 'qty')::int, 1)) desc
  limit p_limit;
$$;
revoke all on function public.best_seller_ids(integer) from public;
grant execute on function public.best_seller_ids(integer) to anon, authenticated;
