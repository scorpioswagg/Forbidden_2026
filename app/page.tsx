import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Phase 0 Scaffold
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Forbidden 2026 Base Layout
        </h1>
        <p className="text-lg text-slate-300">
          Next.js 14 App Router, Tailwind, Supabase helpers, and shared UI components are
          ready for iteration.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="/legal" variant="primary">
            Legal Overview
          </Button>
          <Button href="/legal/privacy" variant="ghost">
            Privacy Policy
          </Button>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          <p className="font-medium text-white">Checklist</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Next.js dev server boots with App Router.</li>
            <li>Tailwind classes compile and render.</li>
            <li>Supabase helper stubs compile.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
