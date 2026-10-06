-- يزيد عدّاد استخدام الكوبون (تستدعيه دالة الدفع بالسيرفر فقط)
create or replace function public.consume_coupon(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  update public.coupons
     set used_count = used_count + 1
   where upper(code) = upper(trim(p_code))
     and (max_uses is null or used_count < max_uses);
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
revoke all on function public.consume_coupon(text) from public, anon, authenticated;
grant execute on function public.consume_coupon(text) to service_role;
