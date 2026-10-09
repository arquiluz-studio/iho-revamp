-- Storage buckets.
--  * media: public, optimized variants only. Written exclusively by the media pipeline (service role).
--  * project-originals: private high-res project photos, served through short-lived signed URLs.
--  * uploads-tmp: private landing zone for other originals before processing; cleaned up by the pipeline.
-- Paths start with the country code (or `global`), which the insert policies check against the user's roles.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 52428800, array['image/webp', 'image/avif', 'image/svg+xml', 'video/mp4']),
  ('project-originals', 'project-originals', false, 104857600, array['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif']),
  ('uploads-tmp', 'uploads-tmp', false, 104857600, array['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif', 'image/svg+xml', 'video/mp4'])
on conflict (id) do nothing;

create policy "Editors can upload project originals" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'project-originals'
    and private.has_country_role((storage.foldername(name))[1], 'editor')
  );

create policy "Editors can upload media originals" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'uploads-tmp'
    and case
      when (storage.foldername(name))[1] = 'global' then (select private.can_manage_catalog())
      else private.has_country_role((storage.foldername(name))[1], 'editor')
    end
  );
