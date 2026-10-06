-- Book orders are separate from Checkout attempts. All new sales are in EUR.
-- No existing financial or customer records are changed.
create table private.book_editions (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique check (object_path ~ '^editions/[a-f0-9-]+/[a-f0-9]{64}\.pdf$'),
  label text not null check (length(label) between 1 and 120),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index one_active_book_edition on private.book_editions (active) where active;

create table public.book_orders (
  id uuid primary key default gen_random_uuid(),
  format text not null check (format in ('physical','digital')),
  quantity integer not null check (quantity between 1 and 100 and (format = 'physical' or quantity = 1)),
  unit_amount bigint not null,
  currency text not null default 'eur' check (currency = 'eur'),
  expected_amount bigint not null check (expected_amount > 0),
  amount_paid bigint not null default 0 check (amount_paid >= 0),
  amount_refunded bigint not null default 0 check (amount_refunded between 0 and amount_paid),
  payment_status text not null default 'created' check (payment_status in ('created','pending','paid','failed','expired','partially_refunded','refunded')),
  fulfillment_status text not null default 'awaiting_payment' check (fulfillment_status in ('awaiting_payment','ready','preparing','shipped','delivered','available','downloaded','cancelled')),
  livemode boolean not null,
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  checkout_url text,
  edition_id uuid references private.book_editions(id),
  digital_delivery_requested boolean not null default false,
  digital_consent_version text,
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_name text,
  shipping_address jsonb,
  shipping_carrier text,
  tracking_number text,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  downloaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (unit_amount = case when format = 'physical' then 1499 else 399 end),
  check (expected_amount = unit_amount * quantity),
  check (format = 'physical' or (edition_id is not null and digital_delivery_requested and digital_consent_version = 'immediate-delivery-v1'))
);
create index book_orders_created on public.book_orders (livemode,created_at desc,id desc);

create table private.book_order_tokens (
  order_id uuid primary key references public.book_orders(id) on delete cascade,
  request_id uuid not null,
  livemode boolean not null,
  owner_hash text not null check (owner_hash ~ '^[a-f0-9]{64}$'),
  unique (livemode,request_id)
);
create table private.book_payment_events (
  livemode boolean not null,
  event_id text not null,
  event_type text not null,
  event_created bigint not null,
  order_id uuid references public.book_orders(id) on delete set null,
  processed_at timestamptz not null default now(),
  primary key (livemode,event_id)
);
-- A cumulative refund may arrive before the completion event.
create table private.book_refund_totals (
  livemode boolean not null,
  payment_intent_id text not null,
  amount_refunded bigint not null check (amount_refunded >= 0),
  currency text not null check (currency = 'eur'),
  primary key (livemode,payment_intent_id)
);
create table private.book_order_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.book_orders(id) on delete cascade,
  action text not null,
  actor_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index book_history_order on private.book_order_history(order_id,created_at);
create table private.book_payment_config (
  livemode boolean primary key,
  webhook_endpoint_id text,
  webhook_secret_id uuid,
  api_key_secret_id uuid,
  updated_at timestamptz not null default now()
);

alter table public.book_orders enable row level security;
revoke all on public.book_orders from public,anon,authenticated;
grant select on public.book_orders to authenticated;
grant select,insert,update,delete on public.book_orders to service_role;
create policy book_orders_admin_read on public.book_orders for select to authenticated
  using (private.has_admin_permission('orders',true));
do $$ declare t text; begin
  foreach t in array array['book_editions','book_order_tokens','book_payment_events','book_refund_totals','book_order_history','book_payment_config'] loop
    execute format('alter table private.%I enable row level security',t);
    execute format('revoke all on private.%I from public,anon,authenticated',t);
    execute format('grant select,insert,update,delete on private.%I to service_role',t);
  end loop;
end $$;

create function public.begin_book_order(request_id uuid,owner_hash text,book_format text,book_quantity integer,is_live boolean,immediate_delivery boolean default false)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare o public.book_orders; v_order_id uuid; e uuid; v_hash text; v_unit bigint;
begin
  if owner_hash !~ '^[a-f0-9]{64}$' or book_format not in ('physical','digital')
    or book_quantity not between 1 and 100 or (book_format = 'digital' and book_quantity <> 1)
    or (book_format = 'digital' and not immediate_delivery) then raise exception 'Invalid order'; end if;
  -- Serialize concurrent requests even before the order exists.
  perform pg_advisory_xact_lock(hashtextextended(is_live::text || request_id::text,0));
  select t.order_id,t.owner_hash into v_order_id,v_hash from private.book_order_tokens t
    where t.request_id = begin_book_order.request_id and t.livemode = is_live;
  if found then
    select * into o from public.book_orders where id = v_order_id for update;
    if v_hash <> owner_hash or o.format <> book_format or o.quantity <> book_quantity then raise exception 'Order request conflict'; end if;
    return to_jsonb(o);
  end if;
  if book_format = 'digital' then
    select id into e from private.book_editions where active for share;
    if e is null then raise exception 'Digital edition unavailable'; end if;
  end if;
  v_unit := case when book_format = 'physical' then 1499 else 399 end;
  insert into public.book_orders(format,quantity,unit_amount,expected_amount,livemode,edition_id,digital_delivery_requested,digital_consent_version)
    values(book_format,book_quantity,v_unit,v_unit*book_quantity,is_live,e,book_format='digital',case when book_format='digital' then 'immediate-delivery-v1' end)
    returning * into o;
  insert into private.book_order_tokens(order_id,request_id,livemode,owner_hash) values(o.id,request_id,is_live,owner_hash);
  insert into private.book_order_history(order_id,action) values(o.id,'created');
  return to_jsonb(o);
end $$;

create function public.bind_book_checkout(order_id uuid,session_id text,session_url text)
returns void language plpgsql security invoker set search_path = '' as $$
declare o public.book_orders;
begin
  select * into strict o from public.book_orders where id=order_id for update;
  if session_id !~ '^cs_' or session_url !~ '^https://checkout\.stripe\.com/'
    or (o.stripe_session_id is not null and o.stripe_session_id<>session_id) then raise exception 'Checkout mismatch'; end if;
  update public.book_orders set stripe_session_id=session_id,checkout_url=session_url,updated_at=now() where id=order_id;
end $$;

create function public.book_order_for_owner(order_id uuid,token_hash text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select to_jsonb(o) from public.book_orders o join private.book_order_tokens t on t.order_id=o.id
    where o.id=$1 and t.owner_hash=$2;
$$;

create function public.apply_book_payment_event(event_id text,event_type text,is_live boolean,event_created bigint,event_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare o public.book_orders; v_order_id uuid; v_pi text; v_refund bigint; new_status text; v_count integer;
begin
  if event_type not in ('checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','payment_intent.payment_failed','charge.refunded')
    or length(event_id)>255 or event_id !~ '^evt_' then raise exception 'Invalid event'; end if;
  insert into private.book_payment_events(livemode,event_id,event_type,event_created) values(is_live,event_id,event_type,event_created)
    on conflict do nothing;
  get diagnostics v_count=row_count;
  if v_count=0 then return jsonb_build_object('duplicate',true); end if;
  v_pi := nullif(event_data->>'payment_intent_id','');
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

create function public.update_book_delivery(order_id uuid,previous_status text,next_status text,carrier text,tracking text,actor_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare o public.book_orders;
begin
  select * into strict o from public.book_orders where id=order_id for update;
  if o.format<>'physical' or o.amount_paid=0 or o.payment_status not in ('paid','partially_refunded') then raise exception 'Order not dispatchable'; end if;
  if o.fulfillment_status<>previous_status then raise exception 'Delivery status conflict'; end if;
  if not ((previous_status='ready' and next_status='preparing') or (previous_status='preparing' and next_status='shipped') or (previous_status='shipped' and next_status='delivered')) then raise exception 'Invalid delivery transition'; end if;
  if next_status='shipped' and (length(trim(coalesce(carrier,''))) not between 1 and 80 or length(trim(coalesce(tracking,''))) not between 1 and 120) then raise exception 'Carrier and tracking required'; end if;
  update public.book_orders set fulfillment_status=next_status,
    shipping_carrier=case when next_status='shipped' then trim(carrier) else shipping_carrier end,
    tracking_number=case when next_status='shipped' then trim(tracking) else tracking_number end,
    shipped_at=case when next_status='shipped' then now() else shipped_at end,
    delivered_at=case when next_status='delivered' then now() else delivered_at end,updated_at=now() where id=order_id returning * into o;
  insert into private.book_order_history(order_id,action,actor_id,details) values(order_id,'delivery_updated',actor_id,jsonb_build_object('from',previous_status,'to',next_status,'carrier',o.shipping_carrier,'tracking_number',o.tracking_number));
  return to_jsonb(o);
end $$;

create function public.book_edition_configuration()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('digital_available',exists(select 1 from private.book_editions where active),
    'edition',(select jsonb_build_object('id',id,'label',label) from private.book_editions where active));
$$;
create function public.activate_book_edition(object_path text,edition_label text,file_sha256 text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare e private.book_editions;
begin
  perform pg_advisory_xact_lock(hashtextextended('book_active_edition',0));
  update private.book_editions set active=false where active;
  insert into private.book_editions(object_path,label,sha256,active) values(object_path,edition_label,file_sha256,true)
    on conflict on constraint book_editions_object_path_key do update set active=true returning * into e;
  return jsonb_build_object('id',e.id,'label',e.label);
end $$;
create function public.book_download_for_owner(order_id uuid,token_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare o public.book_orders; e private.book_editions;
begin
  select b.* into o from public.book_orders b join private.book_order_tokens t on t.order_id=b.id
    where b.id=book_download_for_owner.order_id and t.owner_hash=token_hash for update of b;
  if not found or o.format<>'digital' or o.payment_status not in ('paid','partially_refunded') or o.fulfillment_status='cancelled' then return null; end if;
  select * into strict e from private.book_editions where id=o.edition_id;
  return jsonb_build_object('object_path',e.object_path,'label',e.label);
end $$;
create function public.record_book_download(order_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  update public.book_orders set fulfillment_status='downloaded',downloaded_at=coalesce(downloaded_at,now()),updated_at=now()
    where id=order_id and format='digital' and payment_status in ('paid','partially_refunded');
  if found then insert into private.book_order_history(order_id,action) values(order_id,'download_link_issued'); end if;
end $$;

-- Vault access is restricted to a private, narrow server helper. The public
-- wrappers are invoker functions and callable only with the service credential.
create function private.book_secret(is_live boolean,secret_kind text,new_value text default null,endpoint_id text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare secret_id uuid; result text; secret_name text;
begin
  if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Server credential required' using errcode='42501'; end if;
  if secret_kind not in ('webhook','api_key') then raise exception 'Invalid secret kind'; end if;
  secret_name:='budimse_book_' || secret_kind || case when is_live then '_live' else '_test' end;
  select case when secret_kind='webhook' then c.webhook_secret_id else c.api_key_secret_id end into secret_id
    from private.book_payment_config c where c.livemode=is_live;
  if new_value is not null then
    if (secret_kind='webhook' and new_value !~ '^whsec_') or (secret_kind='api_key' and (is_live or new_value !~ '^rk_test_')) then raise exception 'Invalid secret'; end if;
    if secret_id is null then select vault.create_secret(new_value,secret_name,'Book payment configuration') into secret_id;
    else perform vault.update_secret(secret_id,new_value,secret_name); end if;
    insert into private.book_payment_config(livemode,webhook_secret_id,api_key_secret_id,webhook_endpoint_id)
      values(is_live,case when secret_kind='webhook' then secret_id end,case when secret_kind='api_key' then secret_id end,endpoint_id)
      on conflict(livemode) do update set
        webhook_secret_id=coalesce(excluded.webhook_secret_id,private.book_payment_config.webhook_secret_id),
        api_key_secret_id=coalesce(excluded.api_key_secret_id,private.book_payment_config.api_key_secret_id),
        webhook_endpoint_id=coalesce(excluded.webhook_endpoint_id,private.book_payment_config.webhook_endpoint_id),updated_at=now();
    return 'configured';
  end if;
  select decrypted_secret into result from vault.decrypted_secrets where id=secret_id;
  return result;
end $$;
revoke all on function private.book_secret(boolean,text,text,text) from public,anon,authenticated;
grant execute on function private.book_secret(boolean,text,text,text) to service_role;
create function public.book_payment_secret(is_live boolean,secret_kind text)
returns text language sql stable security invoker set search_path = '' as $$ select private.book_secret(is_live,secret_kind); $$;
create function public.configure_book_payment_secret(is_live boolean,secret_kind text,new_value text,endpoint_id text default null)
returns text language sql security invoker set search_path = '' as $$ select private.book_secret(is_live,secret_kind,new_value,endpoint_id); $$;
create function public.book_payment_configuration(is_live boolean)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('webhook_endpoint_id',webhook_endpoint_id,'webhook_configured',webhook_secret_id is not null,'test_key_configured',api_key_secret_id is not null) from private.book_payment_config where livemode=is_live;
$$;
create function public.book_order_totals(is_live boolean)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('currency','eur','paid_orders',count(*) filter(where amount_paid>0),
    'gross_minor',coalesce(sum(amount_paid),0),'refunded_minor',coalesce(sum(amount_refunded),0),
    'net_minor',coalesce(sum(amount_paid-amount_refunded),0)) from public.book_orders where livemode=is_live;
$$;
create function public.list_book_order_history(order_id uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('action',action,'details',details,'created_at',created_at) order by created_at),'[]'::jsonb) from private.book_order_history where book_order_history.order_id=list_book_order_history.order_id;
$$;

do $$ declare f record; begin
  for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('begin_book_order','bind_book_checkout','book_order_for_owner','apply_book_payment_event','update_book_delivery','book_edition_configuration','activate_book_edition','book_download_for_owner','record_book_download','book_payment_secret','configure_book_payment_secret','book_payment_configuration','book_order_totals','list_book_order_history') loop
    execute format('revoke all on function %s from public,anon,authenticated',f.signature);
    execute format('grant execute on function %s to service_role',f.signature);
  end loop;
end $$;

-- No reader can fetch the paid PDF through a public URL. Administrators can
-- upload a new immutable edition; purchases retain their original edition ID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('book-downloads','book-downloads',false,26214400,array['application/pdf'])
  on conflict(id) do update set public=false,file_size_limit=26214400,allowed_mime_types=array['application/pdf'];
create policy book_edition_admin_upload on storage.objects for insert to authenticated
  with check(bucket_id='book-downloads' and private.has_admin_permission('orders',true)
    and name ~ '^editions/[a-f0-9-]+/[a-f0-9]{64}\.pdf$');
create policy book_edition_admin_read on storage.objects for select to authenticated
  using(bucket_id='book-downloads' and private.has_admin_permission('orders',true));
