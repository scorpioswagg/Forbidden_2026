"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordVaultUpload } from "@/app/vault/actions";

export default function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage("Select a file to upload.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setMessage("You must be signed in to upload.");
      return;
    }

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("vault").upload(path, file, {
      upsert: true
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("storagePath", path);
      formData.set("mimeType", file.type || "application/octet-stream");
      const result = await recordVaultUpload(formData);
      if (!result.success) {
        setStatus("error");
        setMessage(result.message ?? "Unable to record upload.");
        return;
      }
      setStatus("idle");
      setFile(null);
      setMessage("Upload stored in vault.");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-amber-200/20 bg-slate-950/80 p-6 shadow-[0_0_60px_-20px_rgba(165,24,24,0.5)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="text-sm text-slate-300">
            Upload to vault
            <input
              type="file"
              className="mt-2 block text-xs text-slate-400"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading" || isPending}
            className="rounded-full bg-amber-200 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-[0_0_24px_rgba(212,175,55,0.6)] transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" || isPending ? "Uploading..." : "Upload"}
          </button>
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
      </div>
    </form>
  );
}
