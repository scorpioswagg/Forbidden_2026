export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
      <p className="text-slate-300">
        This Privacy Policy explains how Forbidden 2026 collects, uses, and protects
        personal information. By using our service, you agree to these practices.
      </p>
      <section className="space-y-6 text-sm text-slate-300">
        <div>
          <p className="text-white">Information we collect</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account data: email address, username, profile details.</li>
            <li>Content data: posts, uploads, and messages you submit.</li>
            <li>Usage data: device identifiers, log data, and analytics events.</li>
            <li>Support data: communications with our support team.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">How we use information</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Operate the platform, including authentication and personalization.</li>
            <li>Enforce safety, moderation, and legal compliance.</li>
            <li>Improve features, performance, and reliability.</li>
            <li>Communicate account updates and service notices.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Admin access disclosure</p>
          <p className="mt-2">
            Our administrators can access account data and content when necessary for
            safety, support, or legal compliance. We limit access to trained staff and log
            administrative actions.
          </p>
        </div>
        <div>
          <p className="text-white">Data retention</p>
          <p className="mt-2">
            We retain data for as long as your account is active or as required by law.
            You can request deletion through support, subject to legal obligations.
          </p>
        </div>
        <div>
          <p className="text-white">Your choices</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Update profile information in account settings.</li>
            <li>Request data access, export, or deletion.</li>
            <li>Opt out of non-essential communications.</li>
          </ul>
        </div>
        <p>
          Contact privacy@forbidden.example for privacy questions or requests.
        </p>
      </section>
    </main>
  );
}
