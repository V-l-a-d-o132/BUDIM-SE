-- Classroom data is private. Only validated capability handlers and current MFA
-- moderators can access it. Historical public game data is left untouched.
create table private.lab_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(left(replace(gen_random_uuid()::text,'-',''),10)),
  name text not null check (length(name) between 2 and 80),
  status text not null default 'open' check (status in ('open','paused','closed')),
  expires_at timestamptz not null default (now() + interval '8 hours'),
  simulators_enabled boolean not null default true,
  analyzer_enabled boolean not null default false,
  moderate_posts boolean not null default true,
  moderate_comments boolean not null default true,
  sort_mode text not null default 'chronological' check (sort_mode in ('chronological','reactions')),
  created_by uuid not null, created_at timestamptz not null default now()
);
create table private.lab_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references private.lab_rooms(id),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  alias text not null check (length(alias) between 2 and 40),
  status text not null default 'pending' check (status in ('pending','approved','revoked')),
  simulators boolean not null default false, analyzer boolean not null default false,
  created_at timestamptz not null default now(),
  unique(id,room_id)
);
create index lab_members_room_idx on private.lab_members(room_id,status,created_at);
create table private.lab_media (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null, member_id uuid not null,
  path text not null unique, mime_type text not null
    check (mime_type in ('image/jpeg','image/png','image/webp','video/mp4','video/webm')),
  size integer not null check (size between 1 and 12582912),
  uploaded boolean not null default false, created_at timestamptz not null default now(),
  foreign key(member_id,room_id) references private.lab_members(id,room_id)
);
create table private.lab_posts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null, member_id uuid not null,
  app_id text not null check (app_id in ('instagram','tiktok','facebook','youtube','x','snapchat')),
  kind text not null default 'post' check (kind in ('post','story','clip','listing')),
  content text not null default '' check (length(content) <= 2000),
  media_id uuid references private.lab_media(id), approved boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key(member_id,room_id) references private.lab_members(id,room_id),
  check (length(trim(content)) > 0 or media_id is not null),
  unique(id,room_id)
);
create index lab_posts_room_idx on private.lab_posts(room_id,created_at desc);
create index lab_posts_media_idx on private.lab_posts(media_id) where media_id is not null;
create table private.lab_comments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null, post_id uuid not null, member_id uuid not null,
  content text not null check (length(trim(content)) between 1 and 1000),
  approved boolean not null default false, created_at timestamptz not null default now(),
  foreign key(member_id,room_id) references private.lab_members(id,room_id),
  foreign key(post_id,room_id) references private.lab_posts(id,room_id) on delete cascade
);
create index lab_comments_post_idx on private.lab_comments(post_id,created_at);
create index lab_comments_room_idx on private.lab_comments(room_id,created_at);
create table private.lab_reactions (
  post_id uuid not null references private.lab_posts(id) on delete cascade,
  member_id uuid not null references private.lab_members(id),
  reaction text not null check (reaction in ('like','love','wow','sad','angry')),
  created_at timestamptz not null default now(), primary key(post_id,member_id)
);
create index lab_reactions_member_idx on private.lab_reactions(member_id);
create table private.lab_saves (
  post_id uuid not null references private.lab_posts(id) on delete cascade,
  member_id uuid not null references private.lab_members(id),
  created_at timestamptz not null default now(), primary key(post_id,member_id)
);
create index lab_saves_member_idx on private.lab_saves(member_id);
create table private.lab_shares (
  post_id uuid not null references private.lab_posts(id) on delete cascade,
  member_id uuid not null references private.lab_members(id),
  created_at timestamptz not null default now(), primary key(post_id,member_id)
);
create index lab_shares_member_idx on private.lab_shares(member_id);
create table private.lab_views (
  post_id uuid not null references private.lab_posts(id) on delete cascade,
  member_id uuid not null references private.lab_members(id),
  created_at timestamptz not null default now(), primary key(post_id,member_id)
);
create index lab_views_member_idx on private.lab_views(member_id);
create table private.lab_follows (
  room_id uuid not null, member_id uuid not null, target_id uuid not null,
  app_id text not null check(app_id in ('instagram','tiktok','facebook','youtube','x','snapchat')),
  created_at timestamptz not null default now(), primary key(member_id,target_id,app_id),
  foreign key(member_id,room_id) references private.lab_members(id,room_id),
  foreign key(target_id,room_id) references private.lab_members(id,room_id),
  check (member_id <> target_id)
);
create index lab_follows_room_idx on private.lab_follows(room_id);
create index lab_follows_target_idx on private.lab_follows(target_id);
create table private.lab_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null, member_id uuid not null, recipient_id uuid,
  app_id text not null check (app_id in ('instagram','tiktok','facebook','x','snapchat','whatsapp','gmail')),
  content text not null check (length(trim(content)) between 1 and 2000),
  subject text not null default '' check (length(subject) <= 100),
  created_at timestamptz not null default now(),
  foreign key(member_id,room_id) references private.lab_members(id,room_id),
  foreign key(recipient_id,room_id) references private.lab_members(id,room_id)
);
create index lab_messages_room_idx on private.lab_messages(room_id,created_at);
create index lab_messages_member_idx on private.lab_messages(member_id,created_at);
create index lab_messages_recipient_idx on private.lab_messages(recipient_id,created_at);
create table private.lab_notifications (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null, member_id uuid not null,
  app_id text not null, content text not null, read boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key(member_id,room_id) references private.lab_members(id,room_id)
);
create index lab_notifications_member_idx on private.lab_notifications(member_id,created_at);
create table private.lab_requests (
  member_id uuid not null references private.lab_members(id),
  request_id uuid not null, fingerprint text not null,
  created_at timestamptz not null default now(), primary key(member_id,request_id)
);
do $$
declare t text;
begin
  foreach t in array array['lab_rooms','lab_members','lab_media','lab_posts','lab_comments',
    'lab_reactions','lab_saves','lab_shares','lab_views','lab_follows','lab_messages','lab_notifications','lab_requests'] loop
    execute format('alter table private.%I enable row level security',t);
    execute format('revoke all on private.%I from public,anon,authenticated',t);
    execute format('grant select,insert,update,delete on private.%I to service_role',t);
  end loop;
end $$;

create function public.lab_check_access(actor_hash text, required_scope text)
returns jsonb language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('member_id',m.id,'room_id',m.room_id)
  from private.lab_members m join private.lab_rooms r on r.id=m.room_id
  where m.token_hash=actor_hash and m.status='approved' and r.status='open' and r.expires_at>now()
    and case required_scope when 'simulators' then m.simulators and r.simulators_enabled
      when 'analyzer' then m.analyzer and r.analyzer_enabled else false end;
$$;

create function public.lab_state(actor_hash text)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare m private.lab_members; r private.lab_rooms; a jsonb; allowed boolean;
begin
  select * into m from private.lab_members where token_hash=actor_hash;
  if not found then return jsonb_build_object('access',null,'participants','[]'::jsonb,
    'posts','[]'::jsonb,'comments','[]'::jsonb,'follows','[]'::jsonb,'messages','[]'::jsonb,'notifications','[]'::jsonb); end if;
  select * into r from private.lab_rooms where id=m.room_id;
  a=jsonb_build_object('member_id',m.id,'alias',m.alias,'status',m.status,
    'simulators',m.simulators,'analyzer',m.analyzer,'room',
    jsonb_build_object('id',r.id,'name',r.name,'status',r.status,'expires_at',r.expires_at,
      'simulators_enabled',r.simulators_enabled,'analyzer_enabled',r.analyzer_enabled,
      'sort_mode',r.sort_mode,'moderate_posts',r.moderate_posts,'moderate_comments',r.moderate_comments));
  allowed=public.lab_check_access(actor_hash,'simulators') is not null;
  if not allowed then return jsonb_build_object('access',a,'participants','[]'::jsonb,
    'posts','[]'::jsonb,'comments','[]'::jsonb,'follows','[]'::jsonb,'messages','[]'::jsonb,'notifications','[]'::jsonb); end if;
  return jsonb_build_object('access',a,
    'participants',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'alias',p.alias) order by p.created_at)
      from private.lab_members p where p.room_id=r.id and p.status='approved'),'[]'::jsonb),
    'posts',coalesce((select jsonb_agg(j order by created_at desc) from (
      select p.created_at,jsonb_build_object('id',p.id,'member_id',p.member_id,'alias',u.alias,
        'app_id',p.app_id,'kind',p.kind,'content',p.content,'approved',p.approved,'created_at',p.created_at,
        'media',case when d.id is not null then jsonb_build_object('id',d.id,'path',d.path,'mime_type',d.mime_type) else null end,
        'likes',(select count(*) from private.lab_reactions x where x.post_id=p.id),
        'comments',(select count(*) from private.lab_comments x where x.post_id=p.id and x.approved),
        'shares',(select count(*) from private.lab_shares x where x.post_id=p.id),
        'views',(select count(*) from private.lab_views x where x.post_id=p.id),
        'reaction',(select x.reaction from private.lab_reactions x where x.post_id=p.id and x.member_id=m.id),
        'saved',exists(select 1 from private.lab_saves x where x.post_id=p.id and x.member_id=m.id),
        'shared',exists(select 1 from private.lab_shares x where x.post_id=p.id and x.member_id=m.id)) j
      from private.lab_posts p join private.lab_members u on u.id=p.member_id
      left join private.lab_media d on d.id=p.media_id and d.uploaded
      where p.room_id=r.id and (p.approved or p.member_id=m.id)
        and (p.kind<>'story' or p.created_at>now()-interval '24 hours')
      order by p.created_at desc limit 200) q),'[]'::jsonb),
    'comments',coalesce((select jsonb_agg(j order by created_at) from (
      select c.created_at,jsonb_build_object('id',c.id,'post_id',c.post_id,'member_id',c.member_id,
        'alias',u.alias,'content',c.content,'approved',c.approved,'created_at',c.created_at) j
      from private.lab_comments c join private.lab_members u on u.id=c.member_id
      join private.lab_posts p on p.id=c.post_id
      where c.room_id=r.id and (p.approved or p.member_id=m.id) and (c.approved or c.member_id=m.id)
      order by c.created_at desc limit 500) q),'[]'::jsonb),
    'follows',coalesce((select jsonb_agg(distinct target_id) from private.lab_follows where member_id=m.id),'[]'::jsonb),
    'app_follows',coalesce((select jsonb_agg(jsonb_build_object('app_id',app_id,'target_id',target_id))
      from private.lab_follows where member_id=m.id),'[]'::jsonb),
    'messages',coalesce((select jsonb_agg(j order by created_at) from (
      select x.created_at,jsonb_build_object('id',x.id,'member_id',x.member_id,'recipient_id',x.recipient_id,
        'alias',u.alias,'app_id',x.app_id,'content',x.content,'subject',x.subject,'created_at',x.created_at) j
      from private.lab_messages x join private.lab_members u on u.id=x.member_id
      where x.room_id=r.id and (x.member_id=m.id or x.recipient_id=m.id or x.recipient_id is null)
      order by x.created_at desc limit 200) q),'[]'::jsonb),
    'notifications',coalesce((select jsonb_agg(to_jsonb(q) - 'member_id' - 'room_id' order by q.created_at desc)
      from (select * from private.lab_notifications where member_id=m.id order by created_at desc limit 100) q),'[]'::jsonb));
end $$;

create function public.lab_join(actor_hash text, room_code text, participant_alias text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r private.lab_rooms; m private.lab_members;
begin
  if actor_hash !~ '^[a-f0-9]{64}$' or length(trim(participant_alias)) not between 2 and 40
    then raise exception 'Invalid request' using errcode='22023'; end if;
  select * into r from private.lab_rooms where code=upper(trim(room_code)) and status='open' and expires_at>now() for share;
  if not found then raise exception 'Заниманието не е отворено или кодът е грешен.' using errcode='22023'; end if;
  select * into m from private.lab_members where token_hash=actor_hash;
  if found and m.room_id<>r.id then raise exception 'Излез от предишното занимание, преди да влезеш в друго.' using errcode='22023'; end if;
  if not found then
    if (select count(*) from private.lab_members where room_id=r.id)>199 then
      raise exception 'Заниманието е запълнено.' using errcode='22023'; end if;
    insert into private.lab_members(room_id,token_hash,alias) values(r.id,actor_hash,trim(participant_alias))
      on conflict(token_hash) do nothing;
  end if;
  return public.lab_state(actor_hash);
end $$;

create function public.lab_command(actor_hash text, operation text, details jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare m private.lab_members; r private.lab_rooms; p private.lab_posts; d private.lab_media;
  target uuid; new_id uuid; desired boolean; text_value text; inserted integer; request_key uuid; request_fingerprint text;
begin
  select * into m from private.lab_members where token_hash=actor_hash for share;
  if not found then raise exception 'Нужно е разрешение от водещия.' using errcode='42501'; end if;
  select * into r from private.lab_rooms where id=m.room_id for share;
  if m.status<>'approved' or not m.simulators or not r.simulators_enabled or r.status<>'open' or r.expires_at<=now()
    then raise exception 'Достъпът до симулаторите не е разрешен.' using errcode='42501'; end if;
  if operation in ('publish','comment','message') then
    request_key=coalesce((details->>'request_id')::uuid,gen_random_uuid());
    request_fingerprint=md5(operation||details::text);
    insert into private.lab_requests(member_id,request_id,fingerprint) values(m.id,request_key,request_fingerprint) on conflict do nothing;
    get diagnostics inserted=row_count;
    if inserted=0 then
      if not exists(select 1 from private.lab_requests x where x.member_id=m.id and x.request_id=request_key and x.fingerprint=request_fingerprint)
        then raise exception 'Тази заявка вече е използвана с различни данни.' using errcode='22023'; end if;
      return public.lab_state(actor_hash);
    end if;
  end if;
  if operation='prepare_upload' then
    if details->>'mime_type' not in ('image/jpeg','image/png','image/webp','video/mp4','video/webm')
      or coalesce((details->>'size')::integer,0) not between 1 and 12582912
      then raise exception 'Invalid media' using errcode='22023'; end if;
    if (select count(*) from private.lab_media where member_id=m.id and created_at>now()-interval '1 hour')>=30
      then raise exception 'Достигнат е лимитът за качване. Опитай по-късно.' using errcode='22023'; end if;
    new_id=gen_random_uuid();
    insert into private.lab_media(id,room_id,member_id,path,mime_type,size)
      values(new_id,r.id,m.id,r.id::text||'/'||m.id::text||'/'||new_id::text,details->>'mime_type',(details->>'size')::integer)
      returning * into d;
    return to_jsonb(d) - 'member_id' - 'room_id';
  elsif operation='media_info' then
    select * into d from private.lab_media where id=(details->>'media_id')::uuid and member_id=m.id and room_id=r.id;
    if not found then raise exception 'Invalid media' using errcode='42501'; end if;
    return to_jsonb(d) - 'member_id' - 'room_id';
  elsif operation='confirm_media' then
    update private.lab_media set uploaded=true where id=(details->>'media_id')::uuid and member_id=m.id and room_id=r.id;
  elsif operation='publish' then
    text_value=trim(coalesce(details->>'content',''));
    if details->>'app_id' not in ('instagram','tiktok','facebook','youtube','x','snapchat')
      or coalesce(details->>'kind','post') not in ('post','story','clip','listing')
      or length(text_value)>2000 or (details->>'app_id'='x' and length(text_value)>280)
      then raise exception 'Провери дължината и вида на публикацията.' using errcode='22023'; end if;
    if details->>'media_id' is not null then
      select * into d from private.lab_media where id=(details->>'media_id')::uuid and member_id=m.id and room_id=r.id and uploaded;
      if not found then raise exception 'Файлът не е готов за публикуване.' using errcode='22023'; end if;
    end if;
    if length(text_value)=0 and d.id is null then raise exception 'Добави текст или файл.' using errcode='22023'; end if;
    insert into private.lab_posts(room_id,member_id,app_id,kind,content,media_id,approved)
      values(r.id,m.id,details->>'app_id',coalesce(details->>'kind','post'),text_value,d.id,not r.moderate_posts);
  elsif operation='follow' then
    target=(details->>'target_id')::uuid;
    if target=m.id or not exists(select 1 from private.lab_members where id=target and room_id=r.id and status='approved')
      then raise exception 'Участникът не е достъпен.' using errcode='42501'; end if;
    desired=coalesce((details->>'active')::boolean,false);
    if desired then insert into private.lab_follows(room_id,member_id,target_id,app_id)
      values(r.id,m.id,target,coalesce(details->>'app_id','instagram')) on conflict do nothing;
    else delete from private.lab_follows where member_id=m.id and target_id=target and app_id=coalesce(details->>'app_id','instagram'); end if;
  elsif operation='message' then
    target=nullif(details->>'recipient_id','')::uuid;
    if target is not null and not exists(select 1 from private.lab_members where id=target and room_id=r.id and status='approved')
      then raise exception 'Получателят не е в заниманието.' using errcode='42501'; end if;
    if details->>'app_id' not in ('instagram','tiktok','facebook','x','snapchat','whatsapp','gmail')
      or length(trim(coalesce(details->>'content',''))) not between 1 and 2000
      or length(coalesce(details->>'subject',''))>100 then raise exception 'Провери съобщението.' using errcode='22023'; end if;
    insert into private.lab_messages(room_id,member_id,recipient_id,app_id,content,subject)
      values(r.id,m.id,target,details->>'app_id',trim(details->>'content'),coalesce(details->>'subject',''));
    insert into private.lab_notifications(room_id,member_id,app_id,content)
      select r.id,u.id,details->>'app_id',m.alias||': ново учебно съобщение'
      from private.lab_members u where u.room_id=r.id and u.status='approved' and u.id<>m.id
        and (target is null or u.id=target);
  elsif operation='read_notifications' then
    update private.lab_notifications set read=true where member_id=m.id
      and (details->>'app_id' is null or app_id=details->>'app_id');
  else
    select * into p from private.lab_posts where id=(details->>'post_id')::uuid and room_id=r.id for update;
    if not found then raise exception 'Публикацията не е достъпна.' using errcode='42501'; end if;
    if operation='delete_post' then
      if p.member_id<>m.id then raise exception 'Можеш да изтриеш само своя публикация.' using errcode='42501'; end if;
      delete from private.lab_posts where id=p.id;
    else
      if not p.approved then raise exception 'Публикацията изчаква одобрение.' using errcode='42501'; end if;
      if operation='react' then
        if details->>'reaction' is null then delete from private.lab_reactions where post_id=p.id and member_id=m.id;
        else
          if details->>'reaction' not in ('like','love','wow','sad','angry') then raise exception 'Invalid reaction' using errcode='22023'; end if;
          insert into private.lab_reactions(post_id,member_id,reaction) values(p.id,m.id,details->>'reaction')
            on conflict(post_id,member_id) do update set reaction=excluded.reaction
            where private.lab_reactions.reaction is distinct from excluded.reaction;
          get diagnostics inserted=row_count;
          if inserted>0 and p.member_id<>m.id then
            insert into private.lab_notifications(room_id,member_id,app_id,content)
              values(r.id,p.member_id,p.app_id,m.alias||': нова реакция към публикацията');
          end if;
        end if;
      elsif operation='comment' then
        text_value=trim(coalesce(details->>'content',''));
        if length(text_value) not between 1 and 1000 then raise exception 'Коментарът трябва да е от 1 до 1000 символа.' using errcode='22023'; end if;
        insert into private.lab_comments(room_id,post_id,member_id,content,approved) values(r.id,p.id,m.id,text_value,not r.moderate_comments);
        if not r.moderate_comments and p.member_id<>m.id then
          insert into private.lab_notifications(room_id,member_id,app_id,content) values(r.id,p.member_id,p.app_id,m.alias||': нов коментар');
        end if;
      elsif operation='save' then
        if coalesce((details->>'active')::boolean,false) then
          insert into private.lab_saves(post_id,member_id) values(p.id,m.id) on conflict do nothing;
        else delete from private.lab_saves where post_id=p.id and member_id=m.id; end if;
      elsif operation='share' then
        if coalesce((details->>'active')::boolean,false) then
          insert into private.lab_shares(post_id,member_id) values(p.id,m.id) on conflict do nothing;
        else delete from private.lab_shares where post_id=p.id and member_id=m.id; end if;
      elsif operation='view' then
        insert into private.lab_views(post_id,member_id) values(p.id,m.id) on conflict do nothing;
      else raise exception 'Invalid operation' using errcode='22023'; end if;
    end if;
  end if;
  return public.lab_state(actor_hash);
end $$;

-- A narrow private definer is necessary for MFA administrators who do not have
-- direct table grants. Authorization is checked before any private data is read.
create function private.lab_admin(operation text, details jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare room uuid; target uuid; member private.lab_members;
begin
  if not private.has_admin_permission('moderate',true) then raise exception 'Forbidden' using errcode='42501'; end if;
  room=nullif(details->>'room_id','')::uuid;
  if operation='create_room' then
    if length(trim(coalesce(details->>'name',''))) not between 2 and 80
      then raise exception 'Името трябва да е от 2 до 80 символа.' using errcode='22023'; end if;
    insert into private.lab_rooms(name,created_by,analyzer_enabled)
      values(trim(details->>'name'),auth.uid(),coalesce((details->>'analyzer_enabled')::boolean,false)) returning id into room;
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
  if room is null then select id into room from private.lab_rooms order by created_at desc limit 1; end if;
  return jsonb_build_object('selected_room',room,
    'rooms',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from
      (select r.*,(select count(*) from private.lab_members m where m.room_id=r.id and m.status='pending') pending
       from private.lab_rooms r order by r.created_at desc limit 30) q),'[]'::jsonb),
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
create function public.lab_admin(operation text, details jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.lab_admin(operation,details); $$;
revoke all on function private.lab_admin(text,jsonb),public.lab_admin(text,jsonb) from public,anon,authenticated;
grant execute on function private.lab_admin(text,jsonb),public.lab_admin(text,jsonb) to authenticated;
revoke all on function public.lab_state(text),public.lab_check_access(text,text),
  public.lab_join(text,text,text),public.lab_command(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.lab_state(text),public.lab_check_access(text,text),
  public.lab_join(text,text,text),public.lab_command(text,text,jsonb) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('classroom-media','classroom-media',false,12582912,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do nothing;
create policy classroom_media_moderator_read on storage.objects for select to authenticated
  using(bucket_id='classroom-media' and private.has_admin_permission('moderate',true));
