import { supabase } from "./supabase";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads a file to the public Supabase Storage 'Media' bucket
 * and returns the permanent public URL.
 */
export async function uploadMedia(
  file: File,
  folder: "avatars" | "campaigns" | "portfolios" = "avatars"
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  let owner = "anon";
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) owner = session.user.id;
  } catch {
    // path still unique without a session
  }

  const extension = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const cleanName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const filePath = `${folder}/${owner}/${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from("Media")
    .upload(filePath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload to Supabase Storage failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("Media").getPublicUrl(filePath);
  return data.publicUrl;
}
