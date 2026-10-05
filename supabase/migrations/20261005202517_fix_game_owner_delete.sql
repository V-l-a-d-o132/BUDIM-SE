-- Qualify the comment column: the function argument also has the name post_id.
create or replace function public.game_interact(action text, post_id uuid, actor_hash text, details jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare p public.social_game_posts; c public.social_game_comments; was_liked boolean; requested_like boolean; new_post jsonb; begin
  if actor_hash is null or actor_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid actor'; end if;
  select * into p from public.social_game_posts where id=post_id for update;
  if not found then raise exception 'Post not found'; end if;
  if action='delete' then
    if not exists(select 1 from private.game_owners o where o.post_id=p.id and o.token_hash=actor_hash) then raise exception 'Not owner'; end if;
    delete from public.social_game_comments as target_comments where target_comments.post_id=p.id;
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
notify pgrst, 'reload schema';
