import Link from "next/link";

export default function LegalIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Legal</h1>
      <p className="text-slate-300">
        This hub contains draft legal documentation for Forbidden 2026. Final copy will be
        reviewed with counsel before launch. These placeholders outline the expected
        structure and topics that will appear in each policy.
      </p>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
        <p className="text-white">Included drafts</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Privacy Policy: how we collect and process personal data.</li>
          <li>Terms of Service: user obligations, prohibited conduct, and limitations.</li>
          <li>Community Guidelines: acceptable content and reporting flow.</li>
        </ul>
      </div>
      <div className="flex gap-4 text-sm">
        <Link className="text-slate-200 hover:text-white" href="/legal/privacy">
          Privacy Policy
        </Link>
        <Link className="text-slate-200 hover:text-white" href="/legal/terms">
          Terms of Service
        </Link>
        <Link className="text-slate-200 hover:text-white" href="/legal/guidelines">
          Community Guidelines
        </Link>
      </div>
    </main>
  );
}
