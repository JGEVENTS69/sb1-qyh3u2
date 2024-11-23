-- Activer RLS sur la table users
alter table public.users enable row level security;

-- Supprimer les anciennes politiques
drop policy if exists "Enable insert for authentication" on public.users;
drop policy if exists "Enable read access for all users" on public.users;
drop policy if exists "Enable update for users based on id" on public.users;
drop policy if exists "Enable delete for users based on id" on public.users;
drop policy if exists "Anyone can view book boxes" on public.book_boxes;

-- Politique pour permettre l'insertion de nouveaux utilisateurs
create policy "Enable insert for new users"
on public.users for insert
with check (true);

-- Politique pour la lecture
create policy "Enable read access for all users"
on public.users for select
using (true);

-- Politique pour la mise à jour
create policy "Enable update for users based on id"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Politique pour la suppression
create policy "Enable delete for users based on id"
on public.users for delete
using (auth.uid() = id);

-- Activer RLS sur les autres tables
alter table public.book_boxes enable row level security;
alter table public.favorites enable row level security;

-- Politique pour permettre la lecture publique des boîtes à livres
create policy "Anyone can view book boxes"
on public.book_boxes for select
using (true);