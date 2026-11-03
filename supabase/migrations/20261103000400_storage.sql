-- =============================================================================
-- Migración 4: Supabase Storage
-- =============================================================================
-- Convención de rutas: <bucket>/<user_id>/<archivo>
-- Lectura pública por URL (buckets públicos); escritura solo en tu carpeta.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',       'avatars',       true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('career-covers', 'career-covers', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('club-logos',    'club-logos',    true, 1048576, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "storage: subir a mi carpeta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars','career-covers','club-logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: actualizar en mi carpeta"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars','career-covers','club-logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage: borrar de mi carpeta"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars','career-covers','club-logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
