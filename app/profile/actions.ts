"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FollowState = {
  success: boolean;
  message?: string;
};

export async function toggleFollow(formData: FormData): Promise<FollowState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const targetId = String(formData.get("targetId"));

  if (!targetId || targetId === user.id) {
    return { success: false, message: "Invalid follow target." };
  }

  const { data: existingFollow } = await supabase
    .from("follows")
    .select("status")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existingFollow) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetId,
    status: "accepted"
  });

  if (error) {
    return { success: false, message: error.message };
  }

  await supabase.from("notifications").insert({
    user_id: targetId,
    actor_id: user.id,
    notification_type: "follow",
    entity_id: targetId
  });

  return { success: true };
}
