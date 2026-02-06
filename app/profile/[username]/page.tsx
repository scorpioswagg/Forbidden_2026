import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toggleFollow } from "@/app/profile/actions";

export default async function ProfilePage({
  params
}: {
  params: { username: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, pronouns, bio")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: admirerRows } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", profile.id)
    .eq("status", "accepted");

  const admirerCount = admirerRows?.length ?? 0;

  const { data: isFollowing } = user
    ? await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", profile.id)
        .maybeSingle()
    : { data: null };

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, visibility, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="rounded-3xl border border-amber-200/20 bg-slate-950/70 p-6 shadow-[0_0_60px_-20px_rgba(212,175,55,0.5)]">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          {profile.display_name || profile.username || "Unknown"}
        </h1>
        <p className="text-sm text-amber-100/70">@{profile.username}</p>
        {profile.pronouns ? (
          <p className="mt-2 text-sm text-slate-300">Pronouns: {profile.pronouns}</p>
        ) : null}
        {profile.bio ? <p className="mt-4 text-slate-300">{profile.bio}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <span>
            <span className="text-amber-200">{admirerCount}</span> Admirers
          </span>
        </div>
        {user && user.id !== profile.id ? (
          <form action={toggleFollow} className="mt-4">
            <input type="hidden" name="targetId" value={profile.id} />
            <button
              type="submit"
              className="rounded-full border border-amber-200/40 px-5 py-2 text-sm text-amber-100 hover:border-amber-200 hover:text-white"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </form>
        ) : null}
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Posts</h2>
        {posts?.length ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/60">
                  {post.visibility}
                </p>
                <p className="mt-3 text-slate-200">{post.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No posts yet.</p>
        )}
      </section>
    </main>
  );
}
