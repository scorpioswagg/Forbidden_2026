export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
      <p className="text-slate-300">
        These Terms of Service are draft placeholders. The final terms will define the
        agreement between Forbidden 2026 and account holders, including rights,
        responsibilities, and enforcement procedures.
      </p>
      <section className="space-y-4 text-sm text-slate-300">
        <div>
          <p className="text-white">Key topics to be covered</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Eligibility requirements and account security expectations.</li>
            <li>Prohibited conduct, including harassment and unauthorized sharing.</li>
            <li>Content ownership, licensing, and moderation workflow.</li>
            <li>Payment, rewards, and redemption policies.</li>
          </ul>
        </div>
        <p>
          The final agreement will be published before launch. Continued use of the
          platform will indicate acceptance of the updated terms.
        </p>
      </section>
    </main>
  );
}
