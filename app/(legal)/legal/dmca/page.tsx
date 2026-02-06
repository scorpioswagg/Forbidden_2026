export default function DmcaPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">DMCA Policy</h1>
      <p className="text-slate-300">
        Forbidden 2026 respects intellectual property rights and responds to valid DMCA
        notices. This policy outlines how to submit notices and counter-notices.
      </p>
      <section className="space-y-6 text-sm text-slate-300">
        <div>
          <p className="text-white">Submit a DMCA notice</p>
          <p className="mt-2">
            Email dmca@forbidden.example with a written notice that includes:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your contact information and electronic signature.</li>
            <li>Identification of the copyrighted work.</li>
            <li>Location (URL) of the allegedly infringing material.</li>
            <li>A statement of good faith belief and accuracy under penalty of perjury.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Counter-notices</p>
          <p className="mt-2">
            If you believe content was removed in error, you may submit a counter-notice to
            dmca@forbidden.example with your contact details, the removed material, and a
            statement of good faith.
          </p>
        </div>
        <div>
          <p className="text-white">Admin access disclosure</p>
          <p className="mt-2">
            Administrators may access relevant account and content details to process DMCA
            requests and ensure compliance with legal obligations.
          </p>
        </div>
      </section>
    </main>
  );
}
