-- The caller remains server-only. Wider network budgets support classroom NAT;
-- existing endpoint budgets and the 64-character hashed keys remain enforced.
create or replace function public.consume_rate_limit(bucket_key text, max_requests integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer; begin
  if length(bucket_key) <> 64 or max_requests not between 1 and 20000 then
    raise exception 'Invalid rate limit' using errcode='22023'; end if;
  with expired as (
    select bucket from private.rate_limits where expires_at < now()
    order by expires_at limit 200 for update skip locked
  )
  delete from private.rate_limits r using expired e where r.bucket=e.bucket;
  insert into private.rate_limits(bucket) values(bucket_key)
    on conflict(bucket) do update set hits=private.rate_limits.hits+1 returning hits into n;
  return n <= max_requests;
end $$;
