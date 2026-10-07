-- Cover the complete composite classroom foreign keys, including room isolation.
create index lab_comments_member_room_idx on private.lab_comments(member_id,room_id);
create index lab_comments_post_room_idx on private.lab_comments(post_id,room_id);
create index lab_follows_member_room_idx on private.lab_follows(member_id,room_id);
create index lab_follows_target_room_idx on private.lab_follows(target_id,room_id);
create index lab_media_member_room_idx on private.lab_media(member_id,room_id);
create index lab_messages_member_room_idx on private.lab_messages(member_id,room_id);
create index lab_messages_recipient_room_idx on private.lab_messages(recipient_id,room_id);
create index lab_notifications_member_room_idx on private.lab_notifications(member_id,room_id);
create index lab_posts_member_room_idx on private.lab_posts(member_id,room_id);
