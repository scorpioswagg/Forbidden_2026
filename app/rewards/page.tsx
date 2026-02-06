import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestRedemption } from "@/app/rewards/actions";

export default async function RewardsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, title, description, points_cost, is_active")
    .eq("is_active", true)
    .order("points_cost", { ascending: true });

  const { data: pointsRows } = user
    ? await supabase.from("points_ledger").select("points").eq("user_id", user.id)
    : { data: [] };

  const balance = (pointsRows ?? []).reduce((sum, row) => sum + row.points, 0);

  const { data: redemptions } = user
    ? await supabase
        .from("redemptions")
        .select("id, status, created_at, reward_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const rewardMap = new Map((rewards ?? []).map((reward) => [reward.id, reward]));

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="rounded-3xl border border-amber-200/20 bg-black/70 p-6 shadow-[0_0_60px_-20px_rgba(212,175,55,0.4)]">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Rewards</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Reward Catalog</h1>
          <p className="mt-2 text-sm text-slate-300">
            Redeem your points for curated rewards. Points are deducted only after admin
            approval.
          </p>
          <div className="mt-4 text-sm text-amber-200">Points balance: {balance}</div>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Available rewards</h2>
          {rewards?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {rewards.map((reward) => (
                <article
                  key={reward.id}
                  className="rounded-3xl border border-amber-200/10 bg-black/60 p-5 shadow-[0_0_40px_-24px_rgba(165,24,24,0.8)]"
                >
                  <p className="text-sm font-semibold text-amber-100">{reward.title}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {reward.description ?? "Details coming soon."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-amber-200/70">
                    {reward.points_cost} points
                  </p>
                  <form action={requestRedemption} className="mt-4">
                    <input type="hidden" name="rewardId" value={reward.id} />
                    <input type="hidden" name="pointsCost" value={reward.points_cost} />
                    <button
                      type="submit"
                      disabled={balance < reward.points_cost}
                      className="rounded-full border border-amber-200/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-100 hover:border-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Request redemption
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No rewards available yet.</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Redemption history</h2>
          {redemptions?.length ? (
            <div className="space-y-3">
              {redemptions.map((redemption) => {
                const reward = rewardMap.get(redemption.reward_id);
                return (
                  <div
                    key={redemption.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-amber-100">
                        {reward?.title ?? "Reward"}
                      </p>
                      <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                        {redemption.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Requested {new Date(redemption.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No redemptions yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
