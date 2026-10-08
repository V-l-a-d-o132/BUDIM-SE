-- Keep version writes separate from the classroom permission row's shared lock.
-- Every read still checks current member and room permissions.
create table private.lab_revisions (
  room_id uuid primary key references private.lab_rooms(id) on delete cascade,
  version bigint not null default 1
);
alter table private.lab_revisions enable row level security;
revoke all on private.lab_revisions from public,anon,authenticated;
grant select,insert,update,delete on private.lab_revisions to service_role;
insert into private.lab_revisions(room_id) select id from private.lab_rooms;
create function private.lab_touch_revision()
returns trigger language plpgsql security invoker set search_path='' as $$
declare changed_room uuid;
begin
  if tg_op='UPDATE' and old is not distinct from new then return new; end if;
  if tg_table_name='lab_rooms' then
    if tg_op='DELETE' then return old; end if;
    changed_room=new.id;
  elsif tg_table_name in ('lab_reactions','lab_saves','lab_shares','lab_views') then
    select room_id into changed_room from private.lab_posts
      where id=case when tg_op='DELETE' then old.post_id else new.post_id end;
  else
    changed_room=case when tg_op='DELETE' then old.room_id else new.room_id end;
  end if;
  if changed_room is not null then
    insert into private.lab_revisions(room_id) values(changed_room)
      on conflict(room_id) do update set version=private.lab_revisions.version+1;
  end if;
  return case when tg_op='DELETE' then old else new end;
end $$;
revoke all on function private.lab_touch_revision() from public,anon,authenticated;
do $$
declare t text;
begin
  foreach t in array array['lab_rooms','lab_members','lab_media','lab_posts','lab_comments',
    'lab_reactions','lab_saves','lab_shares','lab_views','lab_follows','lab_messages','lab_notifications'] loop
    execute format('create trigger lab_revision_change after insert or update or delete on private.%I for each row execute function private.lab_touch_revision()',t);
  end loop;
end $$;
create function public.lab_sync(actor_hash text,known_revision text default null)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare m private.lab_members; r private.lab_rooms; revision text; allowed boolean; access jsonb;
begin
  select * into m from private.lab_members where token_hash=actor_hash;
  if not found then return public.lab_state(actor_hash); end if;
  select * into r from private.lab_rooms where id=m.room_id;
  select version::text into revision from private.lab_revisions where room_id=r.id;
  allowed=m.status='approved' and m.simulators and r.simulators_enabled and r.status='open' and r.expires_at>now();
  if allowed and revision=known_revision then
    access=jsonb_build_object('member_id',m.id,'alias',m.alias,'status',m.status,
      'simulators',m.simulators,'analyzer',m.analyzer,'room',
      jsonb_build_object('id',r.id,'name',r.name,'status',r.status,'expires_at',r.expires_at,
        'simulators_enabled',r.simulators_enabled,'analyzer_enabled',r.analyzer_enabled,
        'sort_mode',r.sort_mode,'moderate_posts',r.moderate_posts,'moderate_comments',r.moderate_comments));
    return jsonb_build_object('access',access,'revision',revision,'unchanged',true);
  end if;
  -- Read the version before the snapshot: a concurrent change can cause one
  -- redundant read, but can never label older data with a newer version.
  return public.lab_state(actor_hash)||jsonb_build_object('revision',revision);
end $$;
revoke all on function public.lab_sync(text,text) from public,anon,authenticated;
grant execute on function public.lab_sync(text,text) to service_role;
