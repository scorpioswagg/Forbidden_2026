import { createSupabaseServerClient } from "@/lib/supabase/server";
import UploadForm from "@/app/vault/UploadForm";
import { createTeaser } from "@/app/vault/actions";

const LEVELS = [
  { name: "Seed", min: 0, max: 9 },
  { name: "Bloom", min: 10, max: 24 },
  { name: "Ripe", min: 25, max: 49 },
  { name: "Forbidden", min: 50, max: Number.POSITIVE_INFINITY }
];

function getLevel(points: number) {
  return LEVELS.find((level) => points >= level.min && points <= level.max) ?? LEVELS[0];
}

export default async function VaultPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: vaultItems } = user
    ? await supabase
        .from("vault_media")
        .select("id, storage_path, media_type, created_at, is_teaser, teaser_post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: pointsRows } = user
    ? await supabase
        .from("points_ledger")
        .select("points")
        .eq("user_id", user.id)
    : { data: [] };

  const totalPoints = (pointsRows ?? []).reduce((sum, row) => sum + row.points, 0);
  const level = getLevel(totalPoints);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-3xl border border-amber-200/20 bg-black/70 p-6 shadow-[0_0_60px_-20px_rgba(212,175,55,0.4)]">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Vault</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Private Vault</h1>
          <p className="mt-2 text-sm text-slate-300">
            Upload private media, track points, and publish teasers for your admirers.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-full border border-amber-200/40 px-4 py-2 text-amber-100">
              Level: {level.name}
            </span>
            <span className="text-amber-200">{totalPoints} points</span>
          </div>
        </header>

        <UploadForm />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Your vault items</h2>
          {vaultItems?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {vaultItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-amber-200/10 bg-black/60 p-5 shadow-[0_0_40px_-24px_rgba(165,24,24,0.8)]"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                    {item.media_type}
                  </p>
                  <p className="mt-2 text-sm text-slate-200">{item.storage_path}</p>
                  {item.is_teaser ? (
                    <p className="mt-3 text-xs text-emerald-200">Teaser is live.</p>
                  ) : (
                    <form action={createTeaser} className="mt-4">
                      <input type="hidden" name="vaultId" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-amber-200/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-100 hover:border-amber-200"
                      >
                        Use as teaser
                      </button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No vault uploads yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
