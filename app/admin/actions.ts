"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";

export type AdminActionState = {
  success: boolean;
  message?: string;
};

async function logAdminAction(options: {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServerClient();
  await supabase.from("admin_audit_log").insert({
    admin_id: options.adminId,
    action: options.action,
    target_type: options.targetType,
    target_id: options.targetId ?? null,
    metadata: options.metadata ?? {}
  });
}

async function ensureAdmin() {
  const { supabase, user, role } = await requireAdmin();
  if (!user || (role !== "admin" && role !== "super_admin")) {
    return { supabase, user: null };
  }
  return { supabase, user };
}

export async function toggleSuspend(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const targetId = String(formData.get("userId") ?? "");
  const shouldSuspend = formData.get("suspend") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: shouldSuspend ? new Date().toISOString() : null })
    .eq("id", targetId);

  if (error) {
    return { success: false, message: error.message };
  }

  await logAdminAction({
    adminId: user.id,
    action: shouldSuspend ? "suspend_user" : "unsuspend_user",
    targetType: "profile",
    targetId
  });

  return { success: true };
}

export async function toggleBan(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const targetId = String(formData.get("userId") ?? "");
  const shouldBan = formData.get("ban") === "true";
  const reason = String(formData.get("reason") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      banned_at: shouldBan ? new Date().toISOString() : null,
      ban_reason: shouldBan ? reason || null : null
    })
    .eq("id", targetId);

  if (error) {
    return { success: false, message: error.message };
  }

  await logAdminAction({
    adminId: user.id,
    action: shouldBan ? "ban_user" : "unban_user",
    targetType: "profile",
    targetId,
    metadata: reason ? { reason } : undefined
  });

  return { success: true };
}

export async function resolveReport(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const reportId = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "reviewed");

  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);

  if (error) {
    return { success: false, message: error.message };
  }

  await logAdminAction({
    adminId: user.id,
    action: "resolve_report",
    targetType: "report",
    targetId: reportId,
    metadata: { status }
  });

  return { success: true };
}

export async function createReward(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const pointsCost = Number(formData.get("pointsCost") ?? 0);

  if (!title || !pointsCost) {
    return { success: false, message: "Title and points cost are required." };
  }

  const { data: reward, error } = await supabase
    .from("rewards")
    .insert({
      title,
      description: description || null,
      points_cost: pointsCost,
      is_active: true
    })
    .select("id")
    .single();

  if (error || !reward) {
    return { success: false, message: error?.message ?? "Unable to create reward." };
  }

  await logAdminAction({
    adminId: user.id,
    action: "create_reward",
    targetType: "reward",
    targetId: reward.id
  });

  return { success: true };
}

export async function updateReward(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const rewardId = String(formData.get("rewardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const pointsCost = Number(formData.get("pointsCost") ?? 0);
  const isActive = formData.get("isActive") === "true";

  const { error } = await supabase
    .from("rewards")
    .update({
      title,
      description: description || null,
      points_cost: pointsCost,
      is_active: isActive
    })
    .eq("id", rewardId);

  if (error) {
    return { success: false, message: error.message };
  }

  await logAdminAction({
    adminId: user.id,
    action: "update_reward",
    targetType: "reward",
    targetId: rewardId
  });

  return { success: true };
}

export async function deleteReward(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const rewardId = String(formData.get("rewardId") ?? "");
  const { error } = await supabase.from("rewards").delete().eq("id", rewardId);

  if (error) {
    return { success: false, message: error.message };
  }

  await logAdminAction({
    adminId: user.id,
    action: "delete_reward",
    targetType: "reward",
    targetId: rewardId
  });

  return { success: true };
}

export async function reviewRedemption(formData: FormData): Promise<AdminActionState> {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    return { success: false, message: "Not authorized." };
  }

  const redemptionId = String(formData.get("redemptionId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const { data: redemption } = await supabase
    .from("redemptions")
    .select("id, user_id, reward_id, status")
    .eq("id", redemptionId)
    .maybeSingle();

  if (!redemption) {
    return { success: false, message: "Redemption not found." };
  }

  if (decision === "approve") {
    const { data: reward } = await supabase
      .from("rewards")
      .select("points_cost")
      .eq("id", redemption.reward_id)
      .maybeSingle();

    const pointsCost = reward?.points_cost ?? 0;

    const { error: pointsError } = await supabase.from("points_ledger").insert({
      user_id: redemption.user_id,
      points: -Math.abs(pointsCost),
      reason: "reward_redemption",
      reference_id: redemption.id
    });

    if (pointsError) {
      return { success: false, message: pointsError.message };
    }

    const { error: redemptionError } = await supabase
      .from("redemptions")
      .update({ status: "approved" })
      .eq("id", redemption.id);

    if (redemptionError) {
      return { success: false, message: redemptionError.message };
    }

    await logAdminAction({
      adminId: user.id,
      action: "approve_redemption",
      targetType: "redemption",
      targetId: redemption.id
    });

    return { success: true };
  }

  if (decision === "deny") {
    const { error: denyError } = await supabase
      .from("redemptions")
      .update({ status: "denied" })
      .eq("id", redemption.id);

    if (denyError) {
      return { success: false, message: denyError.message };
    }

    await logAdminAction({
      adminId: user.id,
      action: "deny_redemption",
      targetType: "redemption",
      targetId: redemption.id
    });

    return { success: true };
  }

  return { success: false, message: "Invalid decision." };
}

export async function downloadMedia(formData: FormData) {
  const { supabase, user } = await ensureAdmin();
  if (!user) {
    redirect("/feed");
  }

  const bucket = String(formData.get("bucket") ?? "");
  const path = String(formData.get("path") ?? "");

  if (!bucket || !path) {
    redirect("/admin");
  }

  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60);

  if (!data?.signedUrl) {
    redirect("/admin");
  }

  await logAdminAction({
    adminId: user.id,
    action: "download_media",
    targetType: "storage",
    targetId: path,
    metadata: { bucket }
  });

  redirect(data.signedUrl);
}
