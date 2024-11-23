-- Supprimer les tables existantes si nécessaire
drop table if exists public.box_visits cascade;
drop table if exists public.favorites cascade;
drop table if exists public.book_boxes cascade;
drop table if exists public.users cascade;

-- Table des utilisateurs
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

-- Table des boîtes à livres
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

-- Table des favoris
create table public.favorites (
  user_id uuid references public.users(id) on delete cascade not null,
  box_id uuid references public.book_boxes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, box_id)
);

-- Table des visites
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

-- Créer des index pour améliorer les performances
create index if not exists box_visits_box_id_idx on public.box_visits(box_id);
create index if not exists box_visits_visitor_id_idx on public.box_visits(visitor_id);
create index if not exists book_boxes_creator_id_idx on public.book_boxes(creator_id);
create index if not exists book_boxes_creator_username_idx on public.book_boxes(creator_username);