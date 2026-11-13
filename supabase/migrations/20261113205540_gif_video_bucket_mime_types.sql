-- Public GIFs stay animated. Project galleries can also store an MP4 or GIF original.

update storage.buckets
set allowed_mime_types = array['image/webp', 'image/avif', 'image/svg+xml', 'image/gif', 'video/mp4']
where id = 'media';

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif', 'image/gif', 'video/mp4']
where id = 'project-originals';

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif', 'image/svg+xml', 'image/gif', 'video/mp4']
where id = 'uploads-tmp';
