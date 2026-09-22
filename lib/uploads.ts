// Upload rules shared by the admin UI (client) and the upload server actions.
// Keep in sync with the bucket's allowed_mime_types in supabase/migrations.
export const UPLOAD_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
export const ACCEPTED_TYPES = Object.keys(UPLOAD_TYPES);
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
// Files live in immutable per-id folders, so they can be cached for a year.
export const IMMUTABLE_CACHE_SECONDS = "31536000";
