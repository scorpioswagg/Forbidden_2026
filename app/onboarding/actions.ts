"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OnboardingState = {
  success: boolean;
  message?: string;
};

export async function submitOnboarding(formData: FormData): Promise<OnboardingState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const isAdult = formData.get("isAdult") === "on";
  const acceptTerms = formData.get("acceptTerms") === "on";
  const acceptPrivacy = formData.get("acceptPrivacy") === "on";
  const acceptGuidelines = formData.get("acceptGuidelines") === "on";

  if (!isAdult || !acceptTerms || !acceptPrivacy || !acceptGuidelines) {
    return {
      success: false,
      message: "All required acknowledgements must be accepted to continue."
    };
  }

  const displayName = (formData.get("displayName") as string | null)?.trim() || null;
  const username = (formData.get("username") as string | null)?.trim() || null;
  const pronouns = (formData.get("pronouns") as string | null)?.trim() || null;

  const now = new Date().toISOString();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      username,
      pronouns,
      is_18_plus: true,
      accepted_terms_at: now,
      accepted_privacy_at: now,
      accepted_guidelines_at: now,
      onboarding_completed_at: now
    },
    { onConflict: "id" }
  );

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
