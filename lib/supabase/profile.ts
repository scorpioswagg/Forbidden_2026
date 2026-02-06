import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileInput = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  username?: string | null;
  pronouns?: string | null;
};

export async function ensureProfile(profile: ProfileInput) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: profile.id,
      display_name: profile.display_name ?? null,
      username: profile.username ?? null,
      pronouns: profile.pronouns ?? null
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
}
