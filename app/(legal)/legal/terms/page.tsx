export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
      <p className="text-slate-300">
        These Terms of Service govern access to Forbidden 2026. By creating an account or
        using the service, you agree to these terms.
      </p>
      <section className="space-y-6 text-sm text-slate-300">
        <div>
          <p className="text-white">Eligibility</p>
          <p className="mt-2">
            You must be at least 18 years old and legally able to enter into this agreement.
          </p>
        </div>
        <div>
          <p className="text-white">Your responsibilities</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Keep your account credentials secure.</li>
            <li>Only upload content you have the right to share.</li>
            <li>Follow our Community Guidelines and all applicable laws.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Prohibited conduct</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Harassment, exploitation, or non-consensual content.</li>
            <li>Illegal activity, fraud, or unauthorized access attempts.</li>
            <li>Distribution of malware or attempts to disrupt the service.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Admin access disclosure</p>
          <p className="mt-2">
            Administrators may review accounts and content for safety, support, or legal
            compliance. We log administrative actions and restrict access to authorized
            staff.
          </p>
        </div>
        <div>
          <p className="text-white">Termination</p>
          <p className="mt-2">
            We may suspend or terminate accounts that violate these terms or our guidelines.
            You may stop using the service at any time.
          </p>
        </div>
        <div>
          <p className="text-white">Disclaimers</p>
          <p className="mt-2">
            The service is provided “as is” without warranties. We are not liable for
            indirect damages or lost profits.
          </p>
        </div>
      </section>
    </main>
  );
}
