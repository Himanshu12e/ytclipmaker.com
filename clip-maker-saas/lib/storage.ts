import { createServiceClient } from "./supabase/service";
import { readFile } from "fs/promises";

const BUCKET_NAME = "clips";

export interface UploadResult {
  clipId: string;
  url: string;
  path: string;
}

export async function uploadClipToStorage(
  userId: string,
  requestId: string,
  clipId: string,
  filePath: string
): Promise<UploadResult> {
  const supabase = createServiceClient();
  const storagePath = `${userId}/${requestId}/${clipId}.mp4`;

  console.log(`[Storage] Uploading clip ${clipId} to ${storagePath}`);

  const fileBuffer = await readFile(filePath);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) {
    console.error(`[Storage] Upload failed for ${clipId}:`, uploadError.message);
    throw new Error(`Failed to upload clip: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  console.log(`[Storage] Clip ${clipId} uploaded: ${urlData.publicUrl}`);

  return {
    clipId,
    url: urlData.publicUrl,
    path: storagePath,
  };
}

export async function uploadMultipleClips(
  userId: string,
  requestId: string,
  clipFiles: Array<{ clipId: string; filePath: string }>
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const clipFile of clipFiles) {
    try {
      const result = await uploadClipToStorage(
        userId,
        requestId,
        clipFile.clipId,
        clipFile.filePath
      );
      results.push(result);
    } catch (error) {
      console.error(`[Storage] Failed to upload clip ${clipFile.clipId}:`, error);
    }
  }

  return results;
}

export async function deleteClipFromStorage(path: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) {
    console.error(`[Storage] Failed to delete ${path}:`, error.message);
  }
}
