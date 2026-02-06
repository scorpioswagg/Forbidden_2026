export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
      <p className="text-slate-300">
        This is placeholder copy for the Forbidden 2026 privacy policy. The final policy
        will describe what data we collect, how we use it, and the choices available to
        account holders.
      </p>
      <section className="space-y-4 text-sm text-slate-300">
        <div>
          <p className="text-white">Information we plan to collect</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account identifiers such as email address and profile metadata.</li>
            <li>Content you upload or create within the platform.</li>
            <li>Usage analytics to improve product performance.</li>
          </ul>
        </div>
        <div>
          <p className="text-white">Planned use of information</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Provide core services and user support.</li>
            <li>Maintain safety, moderation, and compliance obligations.</li>
            <li>Develop new features, insights, and product improvements.</li>
          </ul>
        </div>
        <p>
          You will be able to review, export, or delete your data through account tools.
          Additional details will be included in the final policy.
        </p>
      </section>
    </main>
  );
}
