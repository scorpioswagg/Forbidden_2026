export default function GuidelinesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Community Guidelines</h1>
      <p className="text-slate-300">
        These guidelines set expectations for respectful and lawful behavior on Forbidden
        2026. Violations may result in content removal, suspension, or bans.
      </p>
      <section className="space-y-6 text-sm text-slate-300">
        <div>
          <p className="text-white">Respect and consent</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>No harassment, hate speech, or targeted abuse.</li>
            <li>Do not share content without explicit consent.</li>
            <li>Respect boundaries and privacy of other users.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Safety and legality</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>No illegal content or exploitation.</li>
            <li>No attempts to trade or sell prohibited material.</li>
            <li>Report safety concerns promptly.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Admin access disclosure</p>
          <p className="mt-2">
            Administrators can review content and account activity to enforce these
            guidelines and to respond to safety reports. Administrative actions are logged.
          </p>
        </div>
        <div>
          <p className="text-white">Reporting</p>
          <p className="mt-2">
            Use the reporting tools to flag content or behavior that violates these
            guidelines. We review reports and notify affected users of outcomes when
            appropriate.
          </p>
        </div>
      </section>
    </main>
  );
}
