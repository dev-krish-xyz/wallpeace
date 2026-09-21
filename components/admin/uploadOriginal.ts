import { BUCKET, SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { IMMUTABLE_CACHE_SECONDS } from "./constants";

/** PUTs a file to a Supabase signed upload URL, reporting progress (supabase-js can't). */
export function uploadOriginal(path: string, token: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const url = `${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}?token=${encodeURIComponent(token)}`;
    const body = new FormData();
    body.append("cacheControl", IMMUTABLE_CACHE_SECONDS);
    body.append("", file);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("apikey", SUPABASE_KEY);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status}).`;
      try {
        message = JSON.parse(xhr.responseText).message ?? message;
      } catch {}
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(body);
  });
}
