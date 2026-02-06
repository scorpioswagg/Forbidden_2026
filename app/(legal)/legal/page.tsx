import Link from "next/link";

export default function LegalIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Legal</h1>
      <p className="text-slate-300">
        This hub contains the current legal documentation for Forbidden 2026. The policies
        below describe how we operate the service, how we handle moderation, and what you
        can expect from us. We update these documents as the product evolves.
      </p>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
        <p className="text-white">Included drafts</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Privacy Policy: how we collect, use, and protect data.</li>
          <li>Terms of Service: eligibility, conduct, and enforcement.</li>
          <li>Community Guidelines: content rules and safety expectations.</li>
          <li>DMCA: copyright notices and takedown process.</li>
          <li>Removal & Appeals: how we review, remove, and reinstate content.</li>
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
        <Link className="text-slate-200 hover:text-white" href="/legal/dmca">
          DMCA
        </Link>
        <Link className="text-slate-200 hover:text-white" href="/legal/appeals">
          Removal & Appeals
        </Link>
      </div>
    </main>
  );
}
