-- Local stand-ins for platform-owned schemas. Vault encryption and Storage
-- transport are checked separately against the deployed Supabase project.
create schema vault;
create table vault.secrets(id uuid primary key default gen_random_uuid(),name text unique,secret text);
create view vault.decrypted_secrets as select id,name,secret as decrypted_secret from vault.secrets;
create function vault.create_secret(new_secret text,new_name text default null,new_description text default '',new_key_id uuid default null)
returns uuid language plpgsql as $$ declare result uuid; begin insert into vault.secrets(name,secret) values(new_name,new_secret) returning id into result; return result; end $$;
create function vault.update_secret(secret_id uuid,new_secret text default null,new_name text default null,new_description text default null,new_key_id uuid default null)
returns void language sql as $$ update vault.secrets set secret=coalesce(new_secret,secret),name=coalesce(new_name,name) where id=secret_id; $$;
create schema storage;
grant usage on schema storage to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;
