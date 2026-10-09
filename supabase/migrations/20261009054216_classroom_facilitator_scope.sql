-- A school facilitator can manage owned or explicitly assigned classrooms.
-- Existing rooms, participants and content are preserved; no access is granted here.
create table private.lab_room_facilitators (
  room_id uuid not null references private.lab_rooms(id) on delete cascade,
  user_id uuid not null references public.admin_users(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(room_id,user_id)
);
create index lab_room_facilitators_user_idx on private.lab_room_facilitators(user_id,room_id);
alter table private.lab_room_facilitators enable row level security;
revoke all on private.lab_room_facilitators from public,anon,authenticated;
grant select,insert,update,delete on private.lab_room_facilitators to service_role;

create function private.can_moderate_lab(room_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null
    and (select private.has_admin_permission('moderate',true))
    and exists(select 1 from private.lab_rooms r where r.id=$1 and (
      (select private.has_admin_permission('orders',true))
      or r.created_by=(select auth.uid())
      or exists(select 1 from private.lab_room_facilitators f
        where f.room_id=r.id and f.user_id=(select auth.uid()))));
$$;
revoke all on function private.can_moderate_lab(uuid) from public,anon,authenticated;
grant execute on function private.can_moderate_lab(uuid) to authenticated;

create function private.can_read_lab_media(object_path text)
returns boolean language sql stable security definer set search_path='' as $$
  select case when split_part($1,'/',1) ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
    then private.can_moderate_lab(split_part($1,'/',1)::uuid) else false end;
$$;
revoke all on function private.can_read_lab_media(text) from public,anon,authenticated;
grant execute on function private.can_read_lab_media(text) to authenticated;

drop policy classroom_media_moderator_read on storage.objects;
create policy classroom_media_moderator_read on storage.objects for select to authenticated
  using(bucket_id='classroom-media' and private.can_read_lab_media(name));

create or replace function private.lab_admin(operation text, details jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare room uuid; target uuid; member private.lab_members; central boolean; active boolean;
begin
  if not private.has_admin_permission('moderate',true) then raise exception 'Forbidden' using errcode='42501'; end if;
  central=private.has_admin_permission('orders',true);
  room=nullif(details->>'room_id','')::uuid;
  if operation<>'create_room' and (room is not null or operation<>'list')
    and not private.can_moderate_lab(room) then
    raise exception 'Нямате достъп до това занимание.' using errcode='42501';
  end if;
  if operation='create_room' then
    if length(trim(coalesce(details->>'name',''))) not between 2 and 80
      then raise exception 'Името трябва да е от 2 до 80 символа.' using errcode='22023'; end if;
    insert into private.lab_rooms(name,created_by,analyzer_enabled)
      values(trim(details->>'name'),auth.uid(),coalesce((details->>'analyzer_enabled')::boolean,false)) returning id into room;
  elsif operation='set_facilitator' then
    if not central then raise exception 'Forbidden' using errcode='42501'; end if;
    target=nullif(details->>'user_id','')::uuid;
    active=coalesce((details->>'active')::boolean,false);
    if target is null then raise exception 'Посочете идентификатор на водещ.' using errcode='22023'; end if;
    if active then
      if not exists(select 1 from public.admin_users a join auth.users u on u.id=a.user_id
        where a.user_id=target and a.role='moderator' and (u.banned_until is null or u.banned_until<=now())) then
        raise exception 'Профилът трябва да е действащ водещ с роля moderator.' using errcode='22023';
      end if;
      insert into private.lab_room_facilitators(room_id,user_id) values(room,target) on conflict do nothing;
    else
      delete from private.lab_room_facilitators where room_id=room and user_id=target;
    end if;
  elsif operation='update_room' then
    if details->>'status' is not null and details->>'status' not in ('open','paused','closed')
      then raise exception 'Invalid status' using errcode='22023'; end if;
    if details->>'sort_mode' is not null and details->>'sort_mode' not in ('chronological','reactions')
      then raise exception 'Invalid ordering' using errcode='22023'; end if;
    update private.lab_rooms set status=coalesce(details->>'status',status),
      simulators_enabled=coalesce((details->>'simulators_enabled')::boolean,simulators_enabled),
      analyzer_enabled=coalesce((details->>'analyzer_enabled')::boolean,analyzer_enabled),
      moderate_posts=coalesce((details->>'moderate_posts')::boolean,moderate_posts),
      moderate_comments=coalesce((details->>'moderate_comments')::boolean,moderate_comments),
      sort_mode=coalesce(details->>'sort_mode',sort_mode),
      expires_at=case when details->>'extend_hours' is not null then
        now()+make_interval(hours=>greatest(1,least(24,(details->>'extend_hours')::integer))) else expires_at end
      where id=room;
    if not found then raise exception 'Unknown room' using errcode='22023'; end if;
  elsif operation='approve_member' then
    target=(details->>'member_id')::uuid;
    select * into member from private.lab_members where id=target and room_id=room for update;
    if not found then raise exception 'Unknown participant' using errcode='22023'; end if;
    update private.lab_members set status=case when coalesce((details->>'approved')::boolean,false) then 'approved' else 'revoked' end,
      simulators=coalesce((details->>'simulators')::boolean,false),analyzer=coalesce((details->>'analyzer')::boolean,false) where id=target;
  elsif operation='moderate_post' then
    update private.lab_posts set approved=coalesce((details->>'approved')::boolean,false)
      where id=(details->>'post_id')::uuid and room_id=room;
  elsif operation='moderate_comment' then
    update private.lab_comments set approved=coalesce((details->>'approved')::boolean,false)
      where id=(details->>'comment_id')::uuid and room_id=room;
  elsif operation='delete_post' then
    delete from private.lab_posts where id=(details->>'post_id')::uuid and room_id=room;
  elsif operation='delete_comment' then
    delete from private.lab_comments where id=(details->>'comment_id')::uuid and room_id=room;
  elsif operation='delete_message' then
    delete from private.lab_messages where id=(details->>'message_id')::uuid and room_id=room;
  elsif operation<>'list' then raise exception 'Invalid operation' using errcode='22023';
  end if;
  if room is null then select id into room from private.lab_rooms r where private.can_moderate_lab(r.id) order by created_at desc limit 1; end if;
  return jsonb_build_object('selected_room',room,
    'can_assign_facilitators',central,
    'facilitators',case when central then coalesce((select jsonb_agg(f.user_id order by f.created_at)
      from private.lab_room_facilitators f where f.room_id=room),'[]'::jsonb) else '[]'::jsonb end,
    'rooms',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from
      (select r.*,(select count(*) from private.lab_members m where m.room_id=r.id and m.status='pending') pending
       from private.lab_rooms r where private.can_moderate_lab(r.id) order by r.created_at desc limit 30) q),'[]'::jsonb),
    'members',coalesce((select jsonb_agg(to_jsonb(q) - 'token_hash' order by q.created_at)
      from (select * from private.lab_members where room_id=room order by created_at limit 200) q),'[]'::jsonb),
    'posts',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
      select p.*,u.alias,case when d.id is not null then jsonb_build_object('path',d.path,'mime_type',d.mime_type) else null end media,
        (select count(*) from private.lab_reactions where post_id=p.id) likes,
        (select count(*) from private.lab_views where post_id=p.id) views,
        (select count(*) from private.lab_shares where post_id=p.id) shares
      from private.lab_posts p join private.lab_members u on u.id=p.member_id
      left join private.lab_media d on d.id=p.media_id and d.uploaded
      where p.room_id=room order by p.created_at desc limit 200) q),'[]'::jsonb),
    'comments',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
      select c.*,u.alias from private.lab_comments c join private.lab_members u on u.id=c.member_id
      where c.room_id=room order by c.created_at desc limit 200) q),'[]'::jsonb),
    'messages',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
      select x.*,u.alias from private.lab_messages x join private.lab_members u on u.id=x.member_id
      where x.room_id=room order by x.created_at desc limit 200) q),'[]'::jsonb));
end $$;
