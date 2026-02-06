"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { uploadConfirmTemplate } from "@/lib/email/templates";

export type VaultActionState = {
  success: boolean;
  message?: string;
};

function pointsForMimeType(mimeType: string) {
  if (mimeType.startsWith("video/")) {
    return 10;
  }
  if (mimeType.startsWith("image/")) {
    return 5;
  }
  return 2;
}

export async function recordVaultUpload(
  formData: FormData
): Promise<VaultActionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const storagePath = String(formData.get("storagePath") ?? "");
  const mimeType = String(formData.get("mimeType") ?? "");

  if (!storagePath || !mimeType) {
    return { success: false, message: "Missing file metadata." };
  }

  const { data: vaultItem, error } = await supabase
    .from("vault_media")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      media_type: mimeType
    })
    .select("id")
    .single();

  if (error || !vaultItem) {
    return { success: false, message: error?.message ?? "Unable to save vault item." };
  }

  const points = pointsForMimeType(mimeType);
  const { error: pointsError } = await supabase.from("points_ledger").insert({
    user_id: user.id,
    points,
    reason: "vault_upload",
    reference_id: vaultItem.id
  });

  if (pointsError) {
    return { success: false, message: pointsError.message };
  }

  if (user.email) {
    await sendEmail(user.email, uploadConfirmTemplate({ referenceId: vaultItem.id }));
  }

  return { success: true };
}

export async function createTeaser(formData: FormData): Promise<VaultActionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const vaultId = String(formData.get("vaultId") ?? "");

  if (!vaultId) {
    return { success: false, message: "Missing vault item." };
  }

  const { data: vaultItem } = await supabase
    .from("vault_media")
    .select("id, storage_path, media_type, is_teaser")
    .eq("id", vaultId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vaultItem) {
    return { success: false, message: "Vault item not found." };
  }

  if (vaultItem.is_teaser) {
    return { success: false, message: "This vault item is already a teaser." };
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content: "Teaser drop",
      visibility: "public"
    })
    .select("id")
    .single();

  if (postError || !post) {
    return { success: false, message: postError?.message ?? "Unable to create post." };
  }

  const { error: mediaError } = await supabase.from("post_media").insert({
    post_id: post.id,
    user_id: user.id,
    media_type: vaultItem.media_type,
    url: vaultItem.storage_path
  });

  if (mediaError) {
    return { success: false, message: mediaError.message };
  }

  const { error: vaultError } = await supabase
    .from("vault_media")
    .update({ is_teaser: true, teaser_post_id: post.id })
    .eq("id", vaultItem.id)
    .eq("user_id", user.id);

  if (vaultError) {
    return { success: false, message: vaultError.message };
  }

  return { success: true };
}
