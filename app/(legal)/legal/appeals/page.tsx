export default function AppealsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Removal & Appeals</h1>
      <p className="text-slate-300">
        We remove content that violates our Terms, Community Guidelines, or legal
        requirements. This page explains our removal process and how to appeal.
      </p>
      <section className="space-y-6 text-sm text-slate-300">
        <div>
          <p className="text-white">Removal process</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Reports are reviewed by trained moderators.</li>
            <li>We may remove content, restrict features, or suspend accounts.</li>
            <li>We notify users when an action is taken, when feasible.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Appeals</p>
          <p className="mt-2">
            To appeal a moderation decision, contact appeals@forbidden.example and include
            your username, the affected content, and a brief explanation. We aim to respond
            within 7 business days.
          </p>
        </div>
        <div>
          <p className="text-white">Admin access disclosure</p>
          <p className="mt-2">
            Administrators may review account and content details to investigate reports
            and appeals. Administrative actions are logged.
          </p>
        </div>
      </section>
    </main>
  );
}
