"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Visibility = "public" | "followers" | "private";

export default function CreatePostForm() {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus("error");
      setMessage("You must be signed in to post.");
      return;
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        visibility
      })
      .select("id")
      .single();

    if (error || !post) {
      setStatus("error");
      setMessage(error?.message ?? "Unable to create post.");
      return;
    }

    if (file) {
      const path = `${user.id}/${post.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setStatus("error");
        setMessage(uploadError.message);
        return;
      }

      const { error: mediaError } = await supabase.from("post_media").insert({
        post_id: post.id,
        user_id: user.id,
        media_type: file.type || "file",
        url: path
      });

      if (mediaError) {
        setStatus("error");
        setMessage(mediaError.message);
        return;
      }
    }

    setStatus("success");
    setContent("");
    setFile(null);
    setMessage("Post shared.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-amber-200/20 bg-slate-950/80 p-6 shadow-[0_0_60px_-20px_rgba(165,24,24,0.5)]"
    >
      <div className="flex flex-col gap-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share a new post with your admirers..."
          className="min-h-[120px] w-full rounded-2xl border border-slate-800 bg-black/60 p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
          <label className="flex items-center gap-2">
            Visibility
            <select
              className="rounded-full border border-slate-700 bg-black/40 px-3 py-1 text-sm text-slate-200"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as Visibility)}
            >
              <option value="public">Public</option>
              <option value="followers">Admirers</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Attachment
            <input
              type="file"
              className="text-xs text-slate-400"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        {message ? (
          <p
            className={`rounded-lg border px-3 py-2 text-xs ${
              status === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start rounded-full bg-amber-200 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-[0_0_24px_rgba(212,175,55,0.6)] transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sharing..." : "Share"}
        </button>
      </div>
    </form>
  );
}
