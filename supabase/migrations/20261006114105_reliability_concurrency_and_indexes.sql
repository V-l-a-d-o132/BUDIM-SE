-- Bounded cleanup avoids scanning/deleting every expired limiter bucket on each request.
create index rate_limits_expires_at on private.rate_limits(expires_at);
create index book_payment_events_order_id on private.book_payment_events(order_id);
create index book_orders_edition_id on public.book_orders(edition_id);

-- One SELECT policy per role keeps the same visibility without evaluating two policies.
alter policy news_published_read on public.news to anon;
drop policy news_editor_read on public.news;
create policy news_authenticated_read on public.news for select to authenticated
  using (published is true or (select private.has_admin_permission('news')));
alter policy game_posts_published_read on public.social_game_posts to anon;
drop policy game_posts_moderator_read on public.social_game_posts;
create policy game_posts_authenticated_read on public.social_game_posts for select to authenticated
  using (approved is true or (select private.has_admin_permission('moderate')));
alter policy game_comments_published_read on public.social_game_comments to anon;
drop policy game_comments_moderator_read on public.social_game_comments;
create policy game_comments_authenticated_read on public.social_game_comments for select to authenticated
  using ((approved is true and flagged is not true and exists (
    select 1 from public.social_game_posts p where p.id=post_id and p.approved is true
  )) or (select private.has_admin_permission('moderate')));

create or replace function public.consume_rate_limit(bucket_key text, max_requests integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer; begin
  if length(bucket_key) <> 64 or max_requests not between 1 and 120 then raise exception 'Invalid rate limit'; end if;
  with expired as (
    select bucket from private.rate_limits where expires_at < now()
    order by expires_at limit 200 for update skip locked
  )
  delete from private.rate_limits r using expired e where r.bucket=e.bucket;
  insert into private.rate_limits(bucket) values(bucket_key)
    on conflict(bucket) do update set hits=private.rate_limits.hits+1 returning hits into n;
  return n <= max_requests;
end $$;

create or replace function public.apply_book_payment_event(event_id text,event_type text,is_live boolean,event_created bigint,event_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare o public.book_orders; v_order_id uuid; v_pi text; v_refund bigint; new_status text; v_count integer;
begin
  if event_type not in ('checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','payment_intent.payment_failed','charge.refunded')
    or length(event_id)>255 or event_id !~ '^evt_' then raise exception 'Invalid event'; end if;
  -- Completion and refund events share a lock before either writes its row.
  -- A refund must not miss a payment_intent_id that another transaction has not committed.
  v_pi := nullif(event_data->>'payment_intent_id','');
  if v_pi is not null then
    perform pg_advisory_xact_lock(hashtextextended('book-payment:' || is_live::text || ':' || v_pi,0));
  end if;
  insert into private.book_payment_events(livemode,event_id,event_type,event_created) values(is_live,event_id,event_type,event_created)
    on conflict do nothing;
  get diagnostics v_count=row_count;
  if v_count=0 then return jsonb_build_object('duplicate',true); end if;
  if event_type='charge.refunded' then
    if event_data->>'currency'<>'eur' then return jsonb_build_object('ignored',true); end if;
    v_refund := (event_data->>'amount_refunded')::bigint;
    if v_pi is null or v_refund<0 then raise exception 'Invalid refund'; end if;
    insert into private.book_refund_totals(livemode,payment_intent_id,amount_refunded,currency) values(is_live,v_pi,v_refund,'eur')
      on conflict(livemode,payment_intent_id) do update set amount_refunded=greatest(private.book_refund_totals.amount_refunded,excluded.amount_refunded);
    select * into o from public.book_orders where livemode=is_live and stripe_payment_intent_id=v_pi for update;
    if not found then return jsonb_build_object('deferred_refund',true); end if;
  else
    v_order_id := (event_data->>'order_id')::uuid;
    select * into o from public.book_orders where id=v_order_id and livemode=is_live for update;
    if not found then raise exception 'Unknown book order'; end if;
    if event_data->>'format' is distinct from o.format then raise exception 'Product mismatch'; end if;
    if event_type like 'checkout.session.%' then
      if event_data->>'currency' is distinct from o.currency or (event_data->>'amount_total')::bigint is distinct from o.expected_amount
        or event_data->>'session_id' !~ '^cs_'
        or (o.stripe_session_id is not null and o.stripe_session_id is distinct from event_data->>'session_id') then raise exception 'Checkout amount or session mismatch'; end if;
      if o.stripe_session_id is null then o.stripe_session_id:=event_data->>'session_id'; end if;
    end if;
    if v_pi is not null then
      if o.stripe_payment_intent_id is not null and o.stripe_payment_intent_id<>v_pi then raise exception 'Payment intent mismatch'; end if;
      o.stripe_payment_intent_id:=v_pi;
    end if;
    new_status := case
      when event_type in ('checkout.session.completed','checkout.session.async_payment_succeeded') and event_data->>'payment_status'='paid' and event_data->>'session_status'='complete' then 'paid'
      when event_type='checkout.session.completed' and event_data->>'payment_status'='unpaid' then 'pending'
      when event_type in ('checkout.session.async_payment_failed','payment_intent.payment_failed') then 'failed'
      when event_type='checkout.session.expired' then 'expired'
      else null end;
    if new_status is null then raise exception 'Unconfirmed payment event'; end if;
    -- Late pending/failure/expiry events cannot undo a verified payment or refund.
    if o.amount_paid=0 then
      o.payment_status:=new_status;
      if new_status='paid' then
        o.amount_paid:=o.expected_amount; o.paid_at:=now();
        o.fulfillment_status:=case when o.format='digital' then 'available' else 'ready' end;
        o.customer_email:=event_data->>'customer_email'; o.customer_name:=event_data->>'customer_name';
        o.customer_phone:=event_data->>'customer_phone'; o.shipping_name:=event_data->>'shipping_name';
        o.shipping_address:=event_data->'shipping_address';
        insert into private.book_order_history(order_id,action) values(o.id,'payment_verified');
      end if;
    end if;
  end if;
  if o.stripe_payment_intent_id is not null then
    select amount_refunded into v_refund from private.book_refund_totals where livemode=is_live and payment_intent_id=o.stripe_payment_intent_id;
    if found and o.amount_paid>0 then
      o.amount_refunded:=least(o.amount_paid,greatest(o.amount_refunded,v_refund));
      if o.amount_refunded>0 then o.payment_status:=case when o.amount_refunded=o.amount_paid then 'refunded' else 'partially_refunded' end; end if;
      if o.amount_refunded=o.amount_paid then o.fulfillment_status:='cancelled'; end if;
    end if;
  end if;
  update public.book_orders set stripe_session_id=o.stripe_session_id,stripe_payment_intent_id=o.stripe_payment_intent_id,
    amount_paid=o.amount_paid,amount_refunded=o.amount_refunded,payment_status=o.payment_status,fulfillment_status=o.fulfillment_status,
    customer_email=o.customer_email,customer_name=o.customer_name,customer_phone=o.customer_phone,shipping_name=o.shipping_name,
    shipping_address=o.shipping_address,paid_at=o.paid_at,updated_at=now() where id=o.id;
  update private.book_payment_events set order_id=o.id where livemode=is_live and book_payment_events.event_id=apply_book_payment_event.event_id;
  return jsonb_build_object('order_id',o.id,'payment_status',o.payment_status);
end $$;

notify pgrst, 'reload schema';
