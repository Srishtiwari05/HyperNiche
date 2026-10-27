import { supabase } from "./supabase";
import { fetchWithAuth } from "./api";

/**
 * Uploads a file directly to the Supabase Storage 'Media' bucket
 * and returns the public CDN URL.
 */
export async function uploadMedia(
  file: File,
  folder: "avatars" | "campaigns" | "portfolios" = "avatars"
): Promise<string> {
  const extension = file.name.split(".").pop() || "png";
  const cleanName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const filePath = `${folder}/${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from("Media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload to Supabase Storage failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("Media").getPublicUrl(filePath);
  return data.publicUrl;
}
