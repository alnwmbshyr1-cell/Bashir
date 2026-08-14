-- YemenBook social schema for project cjwzfrygvoophdezicrz.
-- Run this file in Supabase SQL Editor while authenticated as the project owner.
-- The app uses only the public anon key; never place the service-role key in Expo.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 6 and 30),
  avatar text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, phone, avatar)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'YemenBook Member'), coalesce(new.raw_user_meta_data->>'phone', '000000'), null);
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  text text not null default '' check (char_length(text) <= 5000),
  image_url text,
  video_url text,
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now(),
  check (image_url is not null or video_url is not null or char_length(trim(text)) > 0)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 140),
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  whatsapp text not null check (char_length(whatsapp) between 6 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  payment_proof text,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected', 'expired')),
  created_at timestamptz not null default now(),
  starts_at timestamptz,
  ends_at timestamptz,
  check ((status <> 'approved') or (starts_at is not null and ends_at is not null))
);

-- Supporting tables are necessary for comments, reactions, and direct messaging.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  text text not null check (char_length(trim(text)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 3000),
  media_url text,
  created_at timestamptz not null default now(),
  check (char_length(trim(body)) > 0 or media_url is not null)
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id, created_at asc);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id, created_at asc);
create unique index if not exists active_ad_per_post_idx on public.ads(post_id) where status in ('pending_review', 'approved');

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.products enable row level security;
alter table public.ads enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists "users read own profile" on public.users;
create policy "users read own profile" on public.users for select to authenticated using (id = auth.uid());
drop policy if exists "users create own profile" on public.users;
create policy "users create own profile" on public.users for insert to authenticated with check (id = auth.uid());
drop policy if exists "users update own profile" on public.users;
create policy "users update own profile" on public.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts for select using (true);
drop policy if exists "posts author create" on public.posts;
create policy "posts author create" on public.posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "posts author update" on public.posts;
create policy "posts author update" on public.posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "posts author delete" on public.posts;
create policy "posts author delete" on public.posts for delete to authenticated using (user_id = auth.uid());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (true);
drop policy if exists "products author create" on public.products;
create policy "products author create" on public.products for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "products author update" on public.products;
create policy "products author update" on public.products for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "products author delete" on public.products;
create policy "products author delete" on public.products for delete to authenticated using (user_id = auth.uid());

drop policy if exists "ad owner sees own request" on public.ads;
create policy "ad owner sees own request" on public.ads for select to authenticated using (user_id = auth.uid() or status = 'approved');
drop policy if exists "ad owner creates own request" on public.ads;
create policy "ad owner creates own request" on public.ads for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.posts p where p.id = ads.post_id and p.user_id = auth.uid()));

drop policy if exists "comments public read" on public.comments;
create policy "comments public read" on public.comments for select using (true);
drop policy if exists "comments author create" on public.comments;
create policy "comments author create" on public.comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "comments author update" on public.comments;
create policy "comments author update" on public.comments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "comments author delete" on public.comments;
create policy "comments author delete" on public.comments for delete to authenticated using (user_id = auth.uid());

drop policy if exists "reactions public read" on public.post_reactions;
create policy "reactions public read" on public.post_reactions for select using (true);
drop policy if exists "reactions own create" on public.post_reactions;
create policy "reactions own create" on public.post_reactions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "reactions own delete" on public.post_reactions;
create policy "reactions own delete" on public.post_reactions for delete to authenticated using (user_id = auth.uid());

drop policy if exists "members see own conversation membership" on public.conversation_members;
create policy "members see own conversation membership" on public.conversation_members for select to authenticated using (user_id = auth.uid());
drop policy if exists "members add themselves" on public.conversation_members;
create policy "members add themselves" on public.conversation_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "conversation members read conversation" on public.conversations;
create policy "conversation members read conversation" on public.conversations for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversations.id and cm.user_id = auth.uid()));
drop policy if exists "messages members read" on public.messages;
create policy "messages members read" on public.messages for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = auth.uid()));
drop policy if exists "messages members send" on public.messages;
create policy "messages members send" on public.messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = auth.uid()));

create or replace function public.start_direct_conversation(other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_conversation uuid;
  new_conversation uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if current_user_id = other_user then
    raise exception 'A direct conversation requires another user';
  end if;
  if not exists (select 1 from public.users where id = other_user) then
    raise exception 'User not found';
  end if;

  select cm1.conversation_id into existing_conversation
  from public.conversation_members cm1
  join public.conversation_members cm2 on cm2.conversation_id = cm1.conversation_id
  where cm1.user_id = current_user_id and cm2.user_id = other_user
  group by cm1.conversation_id
  having count(*) = 2
  limit 1;
  if existing_conversation is not null then
    return existing_conversation;
  end if;

  insert into public.conversations default values returning id into new_conversation;
  insert into public.conversation_members (conversation_id, user_id)
  values (new_conversation, current_user_id), (new_conversation, other_user);
  return new_conversation;
end;
$$;
grant execute on function public.start_direct_conversation(uuid) to authenticated;

-- Public profile names and avatars only. Phone numbers remain private to their owner.
revoke execute on function public.start_direct_conversation(uuid) from public, anon;
grant execute on function public.start_direct_conversation(uuid) to authenticated;

create or replace function public.profile_directory()
returns table(id uuid, name text, avatar text)
language sql
security definer
stable
set search_path = public
as $$
  select u.id, u.name, u.avatar from public.users u order by u.created_at desc limit 100;
$$;
revoke execute on function public.profile_directory() from public, anon;
grant execute on function public.profile_directory() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('post-media', 'post-media', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('product-media', 'product-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('ad-proofs', 'ad-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "members upload post media" on storage.objects;
create policy "members upload post media" on storage.objects for insert to authenticated with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "members manage own post media" on storage.objects;
create policy "members manage own post media" on storage.objects for update to authenticated using (bucket_id = 'post-media' and owner_id = auth.uid()) with check (bucket_id = 'post-media' and owner_id = auth.uid());
drop policy if exists "members delete own post media" on storage.objects;
create policy "members delete own post media" on storage.objects for delete to authenticated using (bucket_id = 'post-media' and owner_id = auth.uid());
drop policy if exists "members upload product media" on storage.objects;
create policy "members upload product media" on storage.objects for insert to authenticated with check (bucket_id = 'product-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "members manage own product media" on storage.objects;
create policy "members manage own product media" on storage.objects for update to authenticated using (bucket_id = 'product-media' and owner_id = auth.uid()) with check (bucket_id = 'product-media' and owner_id = auth.uid());
drop policy if exists "members delete own product media" on storage.objects;
create policy "members delete own product media" on storage.objects for delete to authenticated using (bucket_id = 'product-media' and owner_id = auth.uid());
drop policy if exists "members upload own ad proof" on storage.objects;
create policy "members upload own ad proof" on storage.objects for insert to authenticated with check (bucket_id = 'ad-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "members read own ad proof" on storage.objects;
create policy "members read own ad proof" on storage.objects for select to authenticated using (bucket_id = 'ad-proofs' and owner_id = auth.uid());

alter publication supabase_realtime add table public.posts, public.comments, public.post_reactions, public.messages, public.products, public.ads;
