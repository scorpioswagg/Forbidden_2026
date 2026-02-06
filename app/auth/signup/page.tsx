"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/profile";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    if (data.user) {
      try {
        await ensureProfile({
          id: data.user.id,
          display_name: data.user.user_metadata?.full_name ?? null
        });
      } catch (profileError) {
        setStatus("error");
        setMessage(
          profileError instanceof Error
            ? profileError.message
            : "Unable to create profile."
        );
        return;
      }
    }

    setStatus("success");
    setMessage("Check your email for a confirmation link to finish signing up.");

    if (data.session) {
      router.push("/onboarding");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Auth</p>
        <h1 className="text-3xl font-semibold text-white">Create your account</h1>
        <p className="text-sm text-slate-400">
          Use an email and password. We will send a confirmation email when required.
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
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            minLength={8}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          {status === "loading" ? "Creating account..." : "Create account"}
        </button>
      </form>
      <div className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link className="text-slate-200 hover:text-white" href="/auth/login">
          Sign in
        </Link>
      </div>
    </main>
  );
}
