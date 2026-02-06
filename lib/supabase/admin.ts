import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, role: profile?.role ?? null };
}

export async function ensureSuperAdminRole() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  const list = process.env.SUPER_ADMIN_EMAILS ?? "";
  const emails = list
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!emails.includes(user.email.toLowerCase())) {
    return;
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: "super_admin"
    },
    { onConflict: "id" }
  );
}
