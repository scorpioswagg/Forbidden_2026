"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("If an account exists, a reset link is on the way.");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Auth</p>
        <h1 className="text-3xl font-semibold text-white">Reset your password</h1>
        <p className="text-sm text-slate-400">
          Enter your email and we will send a reset link.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {message ? (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
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
          className="w-full rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <div className="text-sm text-slate-400">
        <Link className="text-slate-200 hover:text-white" href="/auth/login">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
