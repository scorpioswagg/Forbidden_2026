import { createClient } from "@supabase/supabase-js";

type SeedUser = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  pronouns: string;
  bio: string;
  role: "user" | "admin" | "super_admin";
};

const seedUsers: SeedUser[] = [
  {
    email: "dev.creator@forbidden.example",
    password: "DevCreator!2026",
    username: "velvetrose",
    displayName: "Velvet Rose",
    pronouns: "she/her",
    bio: "Late-night poet with a velvet soul.",
    role: "user"
  },
  {
    email: "dev.admin@forbidden.example",
    password: "DevAdmin!2026",
    username: "nightwarden",
    displayName: "Night Warden",
    pronouns: "he/him",
    bio: "Keeping the gates lit for admirers.",
    role: "admin"
  },
  {
    email: "dev.super@forbidden.example",
    password: "DevSuper!2026",
    username: "forbiddenkeeper",
    displayName: "Forbidden Keeper",
    pronouns: "they/them",
    bio: "Caretaker of the forbidden archives.",
    role: "super_admin"
  }
];

async function createOrFetchUser(
  supabase: ReturnType<typeof createClient>,
  user: SeedUser
) {
  const { data: existing } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });

  const found = existing?.users.find((entry) => entry.email === user.email);
  if (found) {
    return found;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create user");
  }

  return data.user;
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  for (const user of seedUsers) {
    const authUser = await createOrFetchUser(supabase, user);

    const now = new Date().toISOString();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: authUser.id,
        username: user.username,
        display_name: user.displayName,
        pronouns: user.pronouns,
        bio: user.bio,
        role: user.role,
        is_18_plus: true,
        accepted_terms_at: now,
        accepted_privacy_at: now,
        accepted_guidelines_at: now,
        onboarding_completed_at: now
      },
      { onConflict: "id" }
    );

    if (error) {
      throw new Error(`Failed to upsert profile for ${user.email}: ${error.message}`);
    }
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, role")
    .in(
      "username",
      seedUsers.map((user) => user.username)
    );

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.username, profile])
  );

  const velvet = profileMap.get("velvetrose");
  const admin = profileMap.get("nightwarden");
  const superAdmin = profileMap.get("forbiddenkeeper");

  if (!velvet || !admin || !superAdmin) {
    throw new Error("Missing seeded profiles.");
  }

  const { data: posts } = await supabase
    .from("posts")
    .insert([
      {
        user_id: velvet.id,
        content: "Public entry: welcome to the velvet hours.",
        visibility: "public"
      },
      {
        user_id: velvet.id,
        content: "Admirers-only note: the vault opens at midnight.",
        visibility: "followers"
      },
      {
        user_id: velvet.id,
        content: "Private reminder: write the next stanza.",
        visibility: "private"
      },
      {
        user_id: admin.id,
        content: "Admin post: keep the house rules close.",
        visibility: "public"
      }
    ])
    .select("id, user_id")
    .order("created_at", { ascending: true });

  const postIds = (posts ?? []).map((post) => post.id);

  if (postIds.length) {
    await supabase.from("follows").upsert({
      follower_id: admin.id,
      following_id: velvet.id,
      status: "accepted"
    });

    await supabase.from("likes").insert([
      { post_id: postIds[0], user_id: admin.id },
      { post_id: postIds[0], user_id: superAdmin.id }
    ]);

    await supabase.from("comments").insert([
      {
        post_id: postIds[0],
        user_id: admin.id,
        body: "Love the tone of this one."
      },
      {
        post_id: postIds[1] ?? postIds[0],
        user_id: superAdmin.id,
        body: "Admirers are listening."
      }
    ]);
  }

  await supabase.from("vault_media").insert([
    {
      user_id: velvet.id,
      storage_path: `${velvet.id}/seeded/audio-intro.mp3`,
      media_type: "audio/mpeg"
    },
    {
      user_id: velvet.id,
      storage_path: `${velvet.id}/seeded/teaser-shot.jpg`,
      media_type: "image/jpeg"
    }
  ]);

  console.log("Seeded users:");
  seedUsers.forEach((user) => {
    console.log(`- ${user.email} / ${user.password} (${user.role})`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
