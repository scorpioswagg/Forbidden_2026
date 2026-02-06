"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { redemptionRequestTemplate } from "@/lib/email/templates";

export type RedemptionState = {
  success: boolean;
  message?: string;
};

export async function requestRedemption(formData: FormData): Promise<RedemptionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const rewardId = String(formData.get("rewardId") ?? "");
  const pointsCost = Number(formData.get("pointsCost") ?? 0);

  if (!rewardId || !pointsCost) {
    return { success: false, message: "Missing reward data." };
  }

  const { data: pointsRows } = await supabase
    .from("points_ledger")
    .select("points")
    .eq("user_id", user.id);

  const balance = (pointsRows ?? []).reduce((sum, row) => sum + row.points, 0);

  if (balance < pointsCost) {
    return { success: false, message: "Insufficient points for this reward." };
  }

  const { data: redemption, error } = await supabase
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: rewardId,
      status: "requested"
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  if (user.email && redemption) {
    await sendEmail(user.email, redemptionRequestTemplate({ referenceId: redemption.id }));
  }

  return { success: true };
}
