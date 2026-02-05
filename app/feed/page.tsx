import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreatePostForm from "@/app/feed/CreatePostForm";
import { addComment, deleteComment, toggleLike } from "@/app/feed/actions";

type Post = {
  id: string;
  user_id: string;
  content: string;
  visibility: string;
  created_at: string;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export default async function FeedPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, user_id, content, visibility, created_at")
    .order("created_at", { ascending: false });

  const { data: likes } = await supabase
    .from("likes")
    .select("id, post_id, user_id")
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("comments")
    .select("id, post_id, user_id, body, created_at")
    .order("created_at", { ascending: true });

  const postUserIds = Array.from(
    new Set((posts ?? []).map((post) => post.user_id))
  );
  const commenterUserIds = Array.from(
    new Set((comments ?? []).map((comment) => comment.user_id))
  );
  const profileIds = Array.from(new Set([...postUserIds, ...commenterUserIds]));

  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", profileIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );

  const { data: notifications } = user
    ? await supabase
        .from("notifications")
        .select("id, actor_id, notification_type, entity_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6)
    : { data: [] };

  const notificationActorIds = Array.from(
    new Set((notifications ?? []).map((note) => note.actor_id).filter(Boolean))
  );

  const { data: actorProfiles } = notificationActorIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", notificationActorIds as string[])
    : { data: [] };

  const actorMap = new Map(
    (actorProfiles ?? []).map((profile) => [profile.id, profile])
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row">
        <section className="flex-1 space-y-8">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">
              Forbidden Social
            </p>
            <h1 className="text-3xl font-semibold text-white">Your Feed</h1>
            <p className="text-sm text-slate-300">
              Follow your admirers, share your thoughts, and keep up with the latest
              whispers.
            </p>
          </header>

          <CreatePostForm />

          <div className="space-y-6">
            {(posts ?? []).map((post) => {
              const author = profileMap.get(post.user_id);
              const postLikes = (likes ?? []).filter((like) => like.post_id === post.id);
              const postComments = (comments ?? []).filter(
                (comment) => comment.post_id === post.id
              );
              const hasLiked = Boolean(
                user && postLikes.some((like) => like.user_id === user.id)
              );

              return (
                <article
                  key={post.id}
                  className="rounded-3xl border border-amber-200/10 bg-black/60 p-6 shadow-[0_0_40px_-24px_rgba(165,24,24,0.8)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-100">
                        {author?.display_name || author?.username || "Unknown"}
                      </p>
                      {author?.username ? (
                        <Link
                          className="text-xs text-amber-200/70 hover:text-amber-100"
                          href={`/profile/${author.username}`}
                        >
                          @{author.username}
                        </Link>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-amber-200/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-200/80">
                      {post.visibility}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-200">{post.content}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <form action={toggleLike}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="postOwnerId" value={post.user_id} />
                      <button
                        type="submit"
                        className="rounded-full border border-amber-200/30 px-3 py-1 text-amber-100 hover:border-amber-200"
                      >
                        {hasLiked ? "Unlike" : "Like"} · {postLikes.length}
                      </button>
                    </form>
                    <span>{postComments.length} comments</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {postComments.map((comment) => {
                      const commenter = profileMap.get(comment.user_id);
                      return (
                        <div
                          key={comment.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                        >
                          <p className="text-xs text-amber-200/70">
                            {commenter?.display_name || commenter?.username || "Unknown"}
                          </p>
                          <p className="mt-2 text-sm text-slate-200">{comment.body}</p>
                          {user?.id === comment.user_id ? (
                            <form action={deleteComment} className="mt-2">
                              <input type="hidden" name="commentId" value={comment.id} />
                              <button
                                type="submit"
                                className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70 hover:text-amber-100"
                              >
                                Delete
                              </button>
                            </form>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <form action={addComment} className="mt-4 flex flex-col gap-3">
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="postOwnerId" value={post.user_id} />
                    <textarea
                      name="body"
                      rows={2}
                      placeholder="Leave a comment..."
                      className="w-full rounded-2xl border border-slate-800 bg-black/40 p-3 text-sm text-slate-200"
                      required
                    />
                    <button
                      type="submit"
                      className="self-start rounded-full border border-amber-200/40 px-4 py-1 text-xs uppercase tracking-[0.3em] text-amber-100 hover:border-amber-200"
                    >
                      Comment
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="w-full max-w-sm space-y-6">
          <div className="rounded-3xl border border-amber-200/20 bg-black/70 p-6">
            <h2 className="text-sm font-semibold text-amber-100">Latest whispers</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {(notifications ?? []).length ? (
                notifications?.map((note) => {
                  const actor = note.actor_id ? actorMap.get(note.actor_id) : null;
                  return (
                    <div key={note.id} className="rounded-2xl bg-slate-950/70 px-4 py-3">
                      <p className="text-xs text-amber-200/70">
                        {actor?.display_name || actor?.username || "Someone"}
                      </p>
                      <p className="mt-2 text-sm text-slate-200">
                        {note.notification_type === "follow"
                          ? "is now admiring you."
                          : note.notification_type === "like"
                            ? "liked your post."
                            : "commented on your post."}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">
                  No notifications yet. Engage with admirers to get started.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
