"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { submitOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = { success: false };

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(submitOnboarding, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/feed");
    }
  }, [state.success, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Onboarding</p>
        <h1 className="text-3xl font-semibold text-white">Let’s finish setting up your profile</h1>
        <p className="text-slate-300">
          Confirm the required acknowledgements and add optional profile details. You can
          update these later.
        </p>
      </header>
      <form className="space-y-6" action={formAction}>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Required acknowledgements</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="isAdult"
                required
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>I confirm I am 18 years of age or older.</span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acceptTerms"
                required
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>I agree to the Terms of Service.</span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acceptPrivacy"
                required
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>I agree to the Privacy Policy.</span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acceptGuidelines"
                required
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>I agree to the Community Guidelines.</span>
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Optional profile details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              Display name
              <input
                type="text"
                name="displayName"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              Username
              <input
                type="text"
                name="username"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              Pronouns
              <input
                type="text"
                name="pronouns"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
              />
            </label>
          </div>
        </section>
        {state.message ? (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {state.message}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
        >
          Complete onboarding
        </button>
      </form>
    </main>
  );
}
