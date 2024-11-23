-- Supprimer toutes les politiques existantes
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can view all profiles" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can delete their own profile" on public.users;
drop policy if exists "Anyone can view book boxes" on public.book_boxes;
drop policy if exists "Authenticated users can add book boxes" on public.book_boxes;
drop policy if exists "Users can update their own book boxes" on public.book_boxes;
drop policy if exists "Users can delete their own book boxes" on public.book_boxes;
drop policy if exists "Users can view their own favorites" on public.favorites;
drop policy if exists "Users can add to favorites" on public.favorites;
drop policy if exists "Users can remove from favorites" on public.favorites;
drop policy if exists "Anyone can view visits" on public.box_visits;
drop policy if exists "Authenticated users can add visits" on public.box_visits;
drop policy if exists "Users can update their own visits" on public.box_visits;
drop policy if exists "Users can delete their own visits" on public.box_visits;

-- Supprimer les politiques de stockage
drop policy if exists "Allow public viewing of avatars" on storage.objects;
drop policy if exists "Allow authenticated users to upload avatar" on storage.objects;
drop policy if exists "Allow users to update their own avatar" on storage.objects;
drop policy if exists "Allow users to delete their own avatar" on storage.objects;

-- Supprimer toutes les tables existantes
drop table if exists public.box_visits cascade;
drop table if exists public.favorites cascade;
drop table if exists public.book_boxes cascade;
drop table if exists public.users cascade;

-- Recréer la table des utilisateurs
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  username text unique not null,
  avatar_url text,
  subscription text not null default 'freemium' check (subscription in ('freemium', 'premium')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recréer la table des boîtes à livres
create table public.book_boxes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  latitude double precision not null,
  longitude double precision not null,
  creator_id uuid references public.users(id) on delete cascade not null,
  creator_username text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recréer la table des favoris
create table public.favorites (
  user_id uuid references public.users(id) on delete cascade not null,
  box_id uuid references public.book_boxes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, box_id)
);

-- Recréer la table des visites
create table public.box_visits (
  id uuid default uuid_generate_v4() primary key,
  box_id uuid references public.book_boxes(id) on delete cascade not null,
  visitor_id uuid references public.users(id) on delete cascade not null,
  visited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  comment text,
  rating integer check (rating >= 1 and rating <= 5)
);

-- Activer RLS sur toutes les tables
alter table public.users enable row level security;
alter table public.book_boxes enable row level security;
alter table public.favorites enable row level security;
alter table public.box_visits enable row level security;

-- Créer les index pour améliorer les performances
create index if not exists box_visits_box_id_idx on public.box_visits(box_id);
create index if not exists box_visits_visitor_id_idx on public.box_visits(visitor_id);
create index if not exists book_boxes_creator_id_idx on public.book_boxes(creator_id);
create index if not exists book_boxes_creator_username_idx on public.book_boxes(creator_username);

-- Recréer les politiques pour la table users
create policy "Users can insert their own profile"
on public.users for insert
with check (auth.uid() = id);

create policy "Users can view all profiles"
on public.users for select
using (true);

create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can delete their own profile"
on public.users for delete
using (auth.uid() = id);

-- Recréer les politiques pour la table book_boxes
create policy "Anyone can view book boxes"
on public.book_boxes for select
using (true);

create policy "Authenticated users can add book boxes"
on public.book_boxes for insert
to authenticated
with check (auth.uid() = creator_id);

create policy "Users can update their own book boxes"
on public.book_boxes for update
using (auth.uid() = creator_id);

create policy "Users can delete their own book boxes"
on public.book_boxes for delete
using (auth.uid() = creator_id);

-- Recréer les politiques pour la table favorites
create policy "Users can view their own favorites"
on public.favorites for select
using (auth.uid() = user_id);

create policy "Users can add to favorites"
on public.favorites for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove from favorites"
on public.favorites for delete
using (auth.uid() = user_id);

-- Recréer les politiques pour la table box_visits
create policy "Anyone can view visits"
on public.box_visits for select
using (true);

create policy "Authenticated users can add visits"
on public.box_visits for insert
to authenticated
with check (auth.uid() = visitor_id);

create policy "Users can update their own visits"
on public.box_visits for update
using (auth.uid() = visitor_id);

create policy "Users can delete their own visits"
on public.box_visits for delete
using (auth.uid() = visitor_id);

-- Recréer les politiques pour le stockage
create policy "Allow public viewing of avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Allow authenticated users to upload avatar"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Allow users to update their own avatar"
on storage.objects for update
to authenticated
using ( 
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text 
);

create policy "Allow users to delete their own avatar"
on storage.objects for delete
to authenticated
using ( 
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text 
);