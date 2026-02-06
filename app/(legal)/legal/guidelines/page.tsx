export default function GuidelinesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Community Guidelines</h1>
      <p className="text-slate-300">
        These guidelines are placeholders. Final community standards will outline the
        expected behavior, moderation process, and reporting channels for Forbidden 2026.
      </p>
      <section className="space-y-4 text-sm text-slate-300">
        <div>
          <p className="text-white">What we plan to enforce</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Respectful interactions and zero tolerance for harassment.</li>
            <li>No non-consensual or illegal content.</li>
            <li>Compliance with age-gated and sensitive content labeling.</li>
          </ul>
        </div>
        <p>
          Reporting and appeals processes will be documented in the final version.
        </p>
      </section>
    </main>
  );
}
