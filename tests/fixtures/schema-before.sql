-- Catalog-derived fixture; contains no production records.
create role anon;
create role authenticated;
create role service_role bypassrls;
grant usage on schema public to anon,authenticated,service_role;
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (id uuid primary key, banned_until timestamptz);
create table auth.mfa_factors (id uuid primary key, user_id uuid references auth.users, status text);
create table auth.sessions (id uuid primary key, user_id uuid references auth.users, factor_id uuid references auth.mfa_factors, aal text, not_after timestamptz);
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb); $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid; $$;
create sequence public.tavora_biometric_logs_id_seq;
create table public.admin_users ("user_id" uuid not null,
"role" text not null,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default now() not null,
constraint "admin_users_role_check" CHECK ((role = ANY (ARRAY['super_admin'::text, 'editor'::text]))),
constraint "admin_users_pkey" PRIMARY KEY (id),
constraint "admin_users_user_id_key" UNIQUE (user_id),
constraint "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE);
alter table public.admin_users enable row level security;
grant all on public.admin_users to anon, authenticated, service_role;
create table public.news ("title" text not null,
"slug" text not null,
"body" text not null,
"image_url" text,
"author_id" uuid,
"id" uuid default gen_random_uuid() not null,
"published" boolean default false not null,
"created_at" timestamp with time zone default now() not null,
"updated_at" timestamp with time zone default now() not null,
constraint "news_pkey" PRIMARY KEY (id),
constraint "news_slug_key" UNIQUE (slug),
constraint "news_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL);
alter table public.news enable row level security;
grant all on public.news to anon, authenticated, service_role;
create table public.contact_submissions ("organization" text not null,
"type" text not null,
"email" text not null,
"message" text,
"ip_hint" text,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default now() not null,
constraint "contact_submissions_type_check" CHECK ((type = ANY (ARRAY['school'::text, 'ngo'::text, 'corporate'::text, 'other'::text]))),
constraint "contact_submissions_pkey" PRIMARY KEY (id));
alter table public.contact_submissions enable row level security;
grant all on public.contact_submissions to anon, authenticated, service_role;
create table public.analyses ("content" text,
"risk_score" integer,
"verdict" text,
"vectors" jsonb,
"markers" jsonb,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default now(),
constraint "analyses_pkey" PRIMARY KEY (id));
alter table public.analyses enable row level security;
grant all on public.analyses to anon, authenticated, service_role;
create table public.tavora_shield_results ("domination_score" integer,
"resilience_score" integer,
"answers" jsonb not null,
"pci_score" integer not null,
"eei_score" integer not null,
"cri_score" integer not null,
"asi_score" integer not null,
"total_score" integer not null,
"classification" text not null,
"classification_details" jsonb not null,
"radar_data" jsonb not null,
"user_agent" text,
"ip_address" text,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
constraint "tavora_shield_results_pkey" PRIMARY KEY (id));
alter table public.tavora_shield_results enable row level security;
grant all on public.tavora_shield_results to anon, authenticated, service_role;
create table public.tavora_biometric_logs ("baseline_v" numeric not null,
"baseline_a" numeric not null,
"peak_card_id" integer,
"peak_text" text,
"peak_pulse" integer,
"recovery_time_seconds" numeric,
"attention_leakage_percent" numeric not null,
"emotional_volatility_percent" numeric not null,
"avg_pulse_bpm" integer not null,
"total_test_time_seconds" numeric not null,
"cards_interacted_count" integer not null,
"total_clicks_count" integer not null,
"user_agent" text,
"ip_address" text,
"id" bigint default nextval('tavora_biometric_logs_id_seq'::regclass) not null,
"protocol_41_activated" boolean default false not null,
"created_at" timestamp with time zone default now(),
constraint "tavora_biometric_logs_pkey" PRIMARY KEY (id));
alter table public.tavora_biometric_logs enable row level security;
grant all on public.tavora_biometric_logs to anon, authenticated, service_role;
create table public.tavora_literacy_logs ("total_time" numeric,
"total_interactions" integer,
"impulse_clicks" integer,
"avg_impulse_index" numeric,
"warnings_bypassed" integer,
"avg_reading_time" numeric,
"response_control" numeric,
"analytical_depth" numeric,
"trigger_awareness" numeric,
"behavioral_baseline" jsonb,
"user_agent" text,
"ip_address" text,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default now(),
constraint "tavora_literacy_logs_pkey" PRIMARY KEY (id));
alter table public.tavora_literacy_logs enable row level security;
grant all on public.tavora_literacy_logs to anon, authenticated, service_role;
create table public.social_game_posts ("platform" text not null,
"content" text not null,
"image_url" text,
"ai_label" text,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default now(),
"username" text default 'Анонимен'::text not null,
"avatar_color" text default 'from-gray-400 to-gray-600'::text not null,
"likes" integer default 0 not null,
"comments" integer default 0 not null,
"shares" integer default 0 not null,
"is_viral" boolean default false not null,
"viral_score" integer default 0 not null,
"ai_reason" text,
"approved" boolean default true not null,
"challenge_id" text,
"session_id" text,
constraint "social_game_posts_platform_check" CHECK ((platform = ANY (ARRAY['instagram'::text, 'tiktok'::text, 'facebook'::text]))),
constraint "social_game_posts_pkey" PRIMARY KEY (id));
alter table public.social_game_posts enable row level security;
grant all on public.social_game_posts to anon, authenticated, service_role;
create table public.social_game_comments ("avatar_color" text default 'from-gray-400 to-gray-500'::text not null,
"post_id" uuid,
"content" text not null,
"session_id" text,
"id" uuid default gen_random_uuid() not null,
"created_at" timestamp with time zone default now(),
"username" text default 'Анонимен'::text not null,
"approved" boolean default true,
"flagged" boolean default false,
constraint "social_game_comments_pkey" PRIMARY KEY (id),
constraint "social_game_comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES social_game_posts(id) ON DELETE CASCADE);
alter table public.social_game_comments enable row level security;
grant all on public.social_game_comments to anon, authenticated, service_role;
create policy "news_admin_all" on public.news as PERMISSIVE for ALL to public using ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.user_id = auth.uid()))));
create policy "news_public_read" on public.news as PERMISSIVE for SELECT to public using ((published = true));
create policy "Allow public insert on analyses" on public.analyses as PERMISSIVE for INSERT to public with check (true);
create policy "Allow public insert on tavora_biometric_logs" on public.tavora_biometric_logs as PERMISSIVE for INSERT to public with check (true);
create policy "allow_anon_insert" on public.contact_submissions as PERMISSIVE for INSERT to anon with check (((char_length(organization) <= 200) AND (char_length(email) <= 200) AND (char_length(COALESCE(message, ''::text)) <= 500)));
create policy "contact_admin_read" on public.contact_submissions as PERMISSIVE for SELECT to public using ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.user_id = auth.uid()))));
create policy "Allow public insert on tavora_literacy_logs" on public.tavora_literacy_logs as PERMISSIVE for INSERT to public with check (true);
create policy "Anyone can insert results" on public.tavora_shield_results as PERMISSIVE for INSERT to public with check (true);
create policy "Users can read recent results" on public.tavora_shield_results as PERMISSIVE for SELECT to public using ((created_at > (now() - '24:00:00'::interval)));
create policy "Anyone can delete posts" on public.social_game_posts as PERMISSIVE for DELETE to public using (true);
create policy "Anyone can insert posts" on public.social_game_posts as PERMISSIVE for INSERT to public with check (true);
create policy "Anyone can read posts" on public.social_game_posts as PERMISSIVE for SELECT to public using (true);
create policy "Anyone can update likes" on public.social_game_posts as PERMISSIVE for UPDATE to public using (true);
create policy "Anyone can update shares" on public.social_game_posts as PERMISSIVE for UPDATE to public using (true) with check (true);
create policy "Safe likes increment check" on public.social_game_posts as PERMISSIVE for UPDATE to public using (true) with check (((likes >= 0) AND (shares >= 0) AND (likes <= 10000000) AND (shares <= 10000000)));
create policy "admin_users_select_own" on public.admin_users as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));
create policy "Anyone can delete comments" on public.social_game_comments as PERMISSIVE for DELETE to public using (true);
create policy "Anyone can insert comments" on public.social_game_comments as PERMISSIVE for INSERT to public with check (true);
create policy "Anyone can read comments" on public.social_game_comments as PERMISSIVE for SELECT to public using (true);