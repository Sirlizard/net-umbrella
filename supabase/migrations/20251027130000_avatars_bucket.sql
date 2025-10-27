-- Create a public storage bucket for user avatars and permissive policies
-- Safe to re-run: use ON CONFLICT and IF NOT EXISTS

-- Create bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public read from avatars bucket
create policy if not exists "Public read access for avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload/update/delete in avatars bucket
create policy if not exists "Authenticated avatar uploads"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'avatars' );

create policy if not exists "Authenticated avatar updates"
  on storage.objects for update to authenticated
  using ( bucket_id = 'avatars' )
  with check ( bucket_id = 'avatars' );

create policy if not exists "Authenticated avatar deletes"
  on storage.objects for delete to authenticated
  using ( bucket_id = 'avatars' );
