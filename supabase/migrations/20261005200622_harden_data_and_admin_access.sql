-- Data and administrator authorization. Preserve existing users and records.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create function private.has_admin_permission(required_permission text, require_mfa boolean default true)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.admin_users a
      join auth.users u on u.id = a.user_id
      join auth.sessions s on s.user_id = a.user_id
      where a.user_id = auth.uid()
        and s.id::text = auth.jwt()->>'session_id'
        and (s.not_after is null or s.not_after > now())
        and (u.banned_until is null or u.banned_until <= now())
        and case required_permission
          when 'access' then a.role in ('super_admin', 'editor', 'moderator')
          when 'news' then a.role in ('super_admin', 'editor')
          when 'moderate' then a.role in ('super_admin', 'moderator')
          when 'orders' then a.role = 'super_admin'
          when 'inquiries' then a.role = 'super_admin'
          when 'private_data' then a.role = 'super_admin'
          else false end
        and (not require_mfa or (
          auth.jwt()->>'aal' = 'aal2' and s.aal::text = 'aal2'
          and exists (select 1 from auth.mfa_factors f
            where f.id = s.factor_id and f.user_id = a.user_id and f.status::text = 'verified')
        ))
    );
$$;
revoke all on function private.has_admin_permission(text, boolean) from public, anon, authenticated;
grant execute on function private.has_admin_permission(text, boolean) to authenticated;

create function public.admin_authorize(required_permission text)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.has_admin_permission(required_permission, true);
$$;
revoke all on function public.admin_authorize(text) from public, anon, authenticated;
grant execute on function public.admin_authorize(text) to authenticated;

create function public.admin_access()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('role', a.role,
    'mfa_verified', private.has_admin_permission('access', true),
    'permissions', coalesce((select jsonb_agg(p) from unnest(array['news','moderate','orders','inquiries','private_data']) p
       where private.has_admin_permission(p, true)), '[]'::jsonb))
  from public.admin_users a
  where a.user_id = auth.uid() and private.has_admin_permission('access', false);
$$;
revoke all on function public.admin_access() from public, anon, authenticated;
grant execute on function public.admin_access() to authenticated;

-- Remove every legacy policy: permissive rules combine with OR.
do $$ declare p record; begin
  for p in select tablename, policyname from pg_policies where schemaname='public'
    and tablename in ('admin_users','news','contact_submissions','analyses','tavora_shield_results',
      'tavora_biometric_logs','tavora_literacy_logs','social_game_posts','social_game_comments')
  loop execute format('drop policy %I on public.%I', p.policyname, p.tablename); end loop;
end $$;

revoke all on public.admin_users, public.news, public.contact_submissions, public.analyses,
  public.tavora_shield_results, public.tavora_biometric_logs, public.tavora_literacy_logs,
  public.social_game_posts, public.social_game_comments from public, anon, authenticated;
grant select(user_id, role) on public.admin_users to authenticated;
grant select on public.news, public.social_game_posts, public.social_game_comments to anon, authenticated;
grant select on public.contact_submissions, public.analyses, public.tavora_shield_results,
  public.tavora_biometric_logs, public.tavora_literacy_logs to authenticated;
-- Moderators can only change moderation fields, never content or counter values.
grant update(approved), delete on public.social_game_posts to authenticated;
grant update(approved, flagged), delete on public.social_game_comments to authenticated;
grant select, insert, update, delete on public.admin_users, public.news, public.contact_submissions, public.analyses, public.tavora_shield_results, public.tavora_biometric_logs, public.tavora_literacy_logs, public.social_game_posts, public.social_game_comments to service_role;
revoke all on public.tavora_biometric_logs_id_seq from public, anon, authenticated;
grant usage, select on public.tavora_biometric_logs_id_seq to service_role;

alter table public.admin_users drop constraint admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check check (role in ('super_admin','editor','moderator'));
alter table public.contact_submissions drop constraint contact_submissions_type_check;
alter table public.contact_submissions add constraint contact_submissions_type_check check (type in ('school','ngo','corporate','media','other'));
alter table public.social_game_posts alter column approved set default false;
alter table public.social_game_comments alter column approved set default false;

create policy admin_membership_self on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()) and (select private.has_admin_permission('access', false)));
create policy news_published_read on public.news for select to anon, authenticated using (published is true);
create policy news_editor_read on public.news for select to authenticated using ((select private.has_admin_permission('news')));
create policy inquiries_authorized_read on public.contact_submissions for select to authenticated using ((select private.has_admin_permission('inquiries')));
create policy analyses_authorized_read on public.analyses for select to authenticated using ((select private.has_admin_permission('private_data')));
create policy assessment_authorized_read on public.tavora_shield_results for select to authenticated using ((select private.has_admin_permission('private_data')));
create policy biometric_authorized_read on public.tavora_biometric_logs for select to authenticated using ((select private.has_admin_permission('private_data')));
create policy literacy_authorized_read on public.tavora_literacy_logs for select to authenticated using ((select private.has_admin_permission('private_data')));
create policy game_posts_published_read on public.social_game_posts for select to anon, authenticated using (approved is true);
create policy game_posts_moderator_read on public.social_game_posts for select to authenticated using ((select private.has_admin_permission('moderate')));
create policy game_posts_moderator_update on public.social_game_posts for update to authenticated
  using ((select private.has_admin_permission('moderate'))) with check ((select private.has_admin_permission('moderate')));
create policy game_posts_moderator_delete on public.social_game_posts for delete to authenticated using ((select private.has_admin_permission('moderate')));
create policy game_comments_published_read on public.social_game_comments for select to anon, authenticated
  using (approved is true and flagged is not true and exists (select 1 from public.social_game_posts p where p.id=post_id and p.approved is true));
create policy game_comments_moderator_read on public.social_game_comments for select to authenticated using ((select private.has_admin_permission('moderate')));
create policy game_comments_moderator_update on public.social_game_comments for update to authenticated
  using ((select private.has_admin_permission('moderate'))) with check ((select private.has_admin_permission('moderate')));
create policy game_comments_moderator_delete on public.social_game_comments for delete to authenticated using ((select private.has_admin_permission('moderate')));

-- Private capability hashes never appear in public game records or Realtime.
create table private.game_owners (
  post_id uuid primary key references public.social_game_posts(id) on delete cascade,
  token_hash text not null check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);
create index game_owners_token_idx on private.game_owners(token_hash, created_at);
create table private.game_reactions (
  post_id uuid references public.social_game_posts(id) on delete cascade,
  token_hash text not null check (token_hash ~ '^[a-f0-9]{64}$'),
  liked boolean not null default false,
  primary key (post_id, token_hash)
);
create table private.rate_limits (
  bucket text primary key check (length(bucket)=64),
  hits integer not null default 1,
  expires_at timestamptz not null default (now() + interval '2 minutes')
);
alter table private.game_owners enable row level security;
alter table private.game_reactions enable row level security;
alter table private.rate_limits enable row level security;
revoke all on all tables in schema private from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema private to service_role;

create function public.consume_rate_limit(bucket_key text, max_requests integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer; begin
  if length(bucket_key) <> 64 or max_requests not between 1 and 120 then raise exception 'Invalid rate limit'; end if;
  delete from private.rate_limits where expires_at < now();
  insert into private.rate_limits(bucket) values(bucket_key)
    on conflict(bucket) do update set hits=private.rate_limits.hits+1 returning hits into n;
  return n <= max_requests;
end $$;
revoke all on function public.consume_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer) to service_role;

create function public.create_game_post(post_data jsonb, owner_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare p public.social_game_posts; begin
  if owner_hash !~ '^[a-f0-9]{64}$' or owner_hash is null then raise exception 'Invalid owner'; end if;
  -- Serialize per owner to prevent racing the publication limit.
  perform pg_advisory_xact_lock(hashtextextended(owner_hash, 0));
  if (select count(*) from private.game_owners where token_hash=owner_hash and created_at>now()-interval '1 day')>=3 then
    raise exception 'Publication limit reached';
  end if;
  if post_data->>'platform' not in ('instagram','tiktok','facebook')
    or length(coalesce(post_data->>'content','')) not between 1 and 2000
    or length(coalesce(post_data->>'username','')) not between 1 and 50 then raise exception 'Invalid post'; end if;
  insert into public.social_game_posts(platform,content,username,avatar_color,likes,comments,shares,is_viral,viral_score,ai_label,ai_reason,approved,challenge_id,session_id)
    values(post_data->>'platform',post_data->>'content',post_data->>'username','from-gray-400 to-gray-600',
      greatest(0,least(10000000,coalesce((post_data->>'likes')::integer,0))),
      greatest(0,least(10000000,coalesce((post_data->>'comments')::integer,0))),
      greatest(0,least(10000000,coalesce((post_data->>'shares')::integer,0))),
      coalesce((post_data->>'is_viral')::boolean,false), greatest(0,least(100,coalesce((post_data->>'viral_score')::integer,0))),
      left(post_data->>'ai_label',100),left(post_data->>'ai_reason',2000),false,left(post_data->>'challenge_id',100),null)
    returning * into p;
  insert into private.game_owners(post_id,token_hash) values(p.id,owner_hash);
  return to_jsonb(p);
end $$;
revoke all on function public.create_game_post(jsonb, text) from public, anon, authenticated;
grant execute on function public.create_game_post(jsonb, text) to service_role;

create function public.game_history(owner_hash text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from
    (select p.* from public.social_game_posts p join private.game_owners o on o.post_id=p.id
      where o.token_hash=owner_hash order by p.created_at desc limit 50) p;
$$;
revoke all on function public.game_history(text) from public, anon, authenticated;
grant execute on function public.game_history(text) to service_role;

create function public.game_interact(action text, post_id uuid, actor_hash text, details jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare p public.social_game_posts; c public.social_game_comments; was_liked boolean; requested_like boolean; new_post jsonb; begin
  if actor_hash is null or actor_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid actor'; end if;
  select * into p from public.social_game_posts where id=post_id for update;
  if not found then raise exception 'Post not found'; end if;
  if action='delete' then
    if not exists(select 1 from private.game_owners o where o.post_id=p.id and o.token_hash=actor_hash) then raise exception 'Not owner'; end if;
    delete from public.social_game_comments where post_id=p.id;
    delete from public.social_game_posts where id=p.id;
    return jsonb_build_object('deleted',true);
  end if;
  if p.approved is not true then raise exception 'Post unavailable'; end if;
  if action='like' then
    if jsonb_typeof(details->'liked') <> 'boolean' or details->'liked' is null then raise exception 'Invalid reaction'; end if;
    requested_like=(details->>'liked')::boolean;
    insert into private.game_reactions(post_id,token_hash) values(p.id,actor_hash) on conflict do nothing;
    select r.liked into was_liked from private.game_reactions r where r.post_id=p.id and r.token_hash=actor_hash;
    if was_liked <> requested_like then
      update private.game_reactions r set liked=requested_like where r.post_id=p.id and r.token_hash=actor_hash;
      update public.social_game_posts set likes=greatest(0,least(10000000,likes+case when requested_like then 1 else -1 end)) where id=p.id returning * into p;
    end if;
    return jsonb_build_object('likes',p.likes,'liked',requested_like);
  elsif action='comment' then
    if length(coalesce(details->>'content','')) not between 1 and 1000
      or length(coalesce(details->>'username','')) not between 1 and 50 then raise exception 'Invalid comment'; end if;
    insert into public.social_game_comments(post_id,content,username,approved,flagged)
      values(p.id,details->>'content',details->>'username',false,false) returning * into c;
    return jsonb_build_object('comment',to_jsonb(c));
  elsif action='repost' then
    new_post=public.create_game_post(jsonb_build_object('platform',details->>'platform','content',left('🔁 Споделено: '||p.content,2000),
      'username','Ти (repost)','ai_label','Споделено съдържание','ai_reason','Образователна симулация.','viral_score',0),actor_hash);
    update public.social_game_posts set shares=least(10000000,shares+1) where id=p.id;
    return jsonb_build_object('post',new_post);
  end if;
  raise exception 'Invalid action';
end $$;
revoke all on function public.game_interact(text, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.game_interact(text, uuid, text, jsonb) to service_role;

create index if not exists social_game_comments_post_id_idx on public.social_game_comments(post_id);
create index if not exists news_author_id_idx on public.news(author_id);

-- Future public objects require deliberate grants as well as RLS.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
notify pgrst, 'reload schema';
