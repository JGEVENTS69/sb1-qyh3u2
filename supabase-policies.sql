-- Supprimer les politiques existantes
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can view all profiles" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can delete their own profile" on public.users;
drop policy if exists "Anyone can view visits" on public.box_visits;
drop policy if exists "Authenticated users can add visits" on public.box_visits;
drop policy if exists "Users can update their own visits" on public.box_visits;
drop policy if exists "Users can delete their own visits" on public.box_visits;

-- Supprimer les politiques de stockage existantes
drop policy if exists "Allow public viewing of avatars" on storage.objects;
drop policy if exists "Allow authenticated users to upload avatar" on storage.objects;
drop policy if exists "Allow users to update their own avatar" on storage.objects;
drop policy if exists "Allow users to delete their own avatar" on storage.objects;

-- Politiques pour la table users
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

-- Politiques pour la table box_visits
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

-- Politiques pour le stockage
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