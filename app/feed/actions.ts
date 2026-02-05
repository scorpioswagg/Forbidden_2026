"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = {
  success: boolean;
  message?: string;
};

async function createNotification(options: {
  userId: string;
  actorId: string;
  type: "like" | "comment";
  entityId: string;
}) {
  if (options.userId === options.actorId) {
    return;
  }

  const supabase = createSupabaseServerClient();
  await supabase.from("notifications").insert({
    user_id: options.userId,
    actor_id: options.actorId,
    notification_type: options.type,
    entity_id: options.entityId
  });
}

export async function toggleLike(formData: FormData): Promise<ActionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const postId = String(formData.get("postId"));
  const postOwnerId = String(formData.get("postOwnerId"));

  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    const { error } = await supabase.from("likes").delete().eq("id", existingLike.id);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  }

  const { error } = await supabase.from("likes").insert({
    post_id: postId,
    user_id: user.id
  });

  if (error) {
    return { success: false, message: error.message };
  }

  await createNotification({
    userId: postOwnerId,
    actorId: user.id,
    type: "like",
    entityId: postId
  });

  return { success: true };
}

export async function addComment(formData: FormData): Promise<ActionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const postId = String(formData.get("postId"));
  const postOwnerId = String(formData.get("postOwnerId"));
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { success: false, message: "Comment cannot be empty." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    body
  });

  if (error) {
    return { success: false, message: error.message };
  }

  await createNotification({
    userId: postOwnerId,
    actorId: user.id,
    type: "comment",
    entityId: postId
  });

  return { success: true };
}

export async function deleteComment(formData: FormData): Promise<ActionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const commentId = String(formData.get("commentId"));
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
