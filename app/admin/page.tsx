import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureSuperAdminRole, requireAdmin } from "@/lib/supabase/admin";
import {
  createReward,
  deleteReward,
  downloadMedia,
  resolveReport,
  reviewRedemption,
  toggleBan,
  toggleSuspend,
  updateReward
} from "@/app/admin/actions";

type SearchParams = {
  query?: string;
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  await ensureSuperAdminRole();
  const { supabase, user, role } = await requireAdmin();

  if (!user || (role !== "admin" && role !== "super_admin")) {
    redirect("/feed");
  }

  const query = searchParams.query?.trim() ?? "";

  const { data: users } = query
    ? await supabase
        .from("profiles")
        .select(
          "id, username, display_name, role, suspended_at, banned_at, ban_reason"
        )
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: vaultMedia } = await supabase
    .from("vault_media")
    .select("id, user_id, storage_path, media_type, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: postMedia } = await supabase
    .from("post_media")
    .select("id, user_id, url, media_type, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const mediaOwnerIds = Array.from(
    new Set([
      ...(vaultMedia ?? []).map((item) => item.user_id),
      ...(postMedia ?? []).map((item) => item.user_id)
    ])
  );

  const { data: mediaOwners } = mediaOwnerIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", mediaOwnerIds)
    : { data: [] };

  const ownerMap = new Map(
    (mediaOwners ?? []).map((profile) => [profile.id, profile])
  );

  const { data: reports } = await supabase
    .from("reports")
    .select("id, reporter_id, target_type, target_id, reason, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, title, description, points_cost, is_active")
    .order("created_at", { ascending: false });

  const { data: redemptions } = await supabase
    .from("redemptions")
    .select("id, user_id, reward_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const rewardMap = new Map((rewards ?? []).map((reward) => [reward.id, reward]));

  const redemptionUserIds = Array.from(
    new Set((redemptions ?? []).map((redemption) => redemption.user_id))
  );

  const { data: redemptionUsers } = redemptionUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", redemptionUserIds)
    : { data: [] };

  const redemptionUserMap = new Map(
    (redemptionUsers ?? []).map((profile) => [profile.id, profile])
  );

  const { data: auditLog } = await supabase
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-3xl border border-amber-200/20 bg-black/70 p-6 shadow-[0_0_60px_-20px_rgba(212,175,55,0.4)]">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Admin Console</h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage users, content, rewards, and moderation queues.
          </p>
          <div className="mt-4 text-sm text-amber-200">Role: {role}</div>
        </header>

        <section className="rounded-3xl border border-amber-200/10 bg-black/60 p-6">
          <h2 className="text-lg font-semibold text-white">User search</h2>
          <form className="mt-4 flex flex-wrap gap-3" method="get">
            <input
              name="query"
              defaultValue={query}
              placeholder="Search by username or display name"
              className="flex-1 rounded-full border border-slate-700 bg-black/50 px-4 py-2 text-sm text-slate-200"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-200/40 px-5 py-2 text-xs uppercase tracking-[0.3em] text-amber-100"
            >
              Search
            </button>
          </form>
          {users?.length ? (
            <div className="mt-4 space-y-3">
              {users.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-amber-100">
                        {profile.display_name || profile.username || "Unknown"}
                      </p>
                      {profile.username ? (
                        <Link
                          className="text-xs text-amber-200/70"
                          href={`/profile/${profile.username}`}
                        >
                          @{profile.username}
                        </Link>
                      ) : null}
                      <p className="text-xs text-slate-400">Role: {profile.role}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <form action={toggleSuspend}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input
                          type="hidden"
                          name="suspend"
                          value={profile.suspended_at ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-amber-200/40 px-3 py-1 text-amber-100"
                        >
                          {profile.suspended_at ? "Unsuspend" : "Suspend"}
                        </button>
                      </form>
                      <form action={toggleBan}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input
                          type="hidden"
                          name="ban"
                          value={profile.banned_at ? "false" : "true"}
                        />
                        {profile.banned_at ? null : (
                          <input
                            name="reason"
                            placeholder="Ban reason"
                            className="rounded-full border border-slate-700 bg-black/50 px-2 py-1 text-[10px] text-slate-200"
                          />
                        )}
                        <button
                          type="submit"
                          className="rounded-full border border-rose-400/40 px-3 py-1 text-rose-200"
                        >
                          {profile.banned_at ? "Unban" : "Ban"}
                        </button>
                      </form>
                    </div>
                  </div>
                  {profile.banned_at ? (
                    <p className="mt-2 text-xs text-rose-200/80">
                      Banned: {profile.ban_reason ?? "No reason provided"}
                    </p>
                  ) : null}
                  {profile.suspended_at ? (
                    <p className="mt-1 text-xs text-amber-200/70">Suspended</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              {query ? "No users found." : "Enter a search term to view users."}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-amber-200/10 bg-black/60 p-6">
          <h2 className="text-lg font-semibold text-white">Media overview</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-amber-100">Vault uploads</h3>
              <div className="mt-3 space-y-3">
                {(vaultMedia ?? []).map((item) => {
                  const owner = ownerMap.get(item.user_id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <p className="text-xs text-amber-200/70">{item.media_type}</p>
                      <p className="mt-1 text-xs text-slate-300">{item.storage_path}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Owner: {owner?.username ?? owner?.display_name ?? "Unknown"}
                      </p>
                      <form action={downloadMedia} className="mt-2">
                        <input type="hidden" name="bucket" value="vault" />
                        <input type="hidden" name="path" value={item.storage_path} />
                        <button
                          type="submit"
                          className="text-xs uppercase tracking-[0.3em] text-amber-200/70"
                        >
                          Download
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-100">Post attachments</h3>
              <div className="mt-3 space-y-3">
                {(postMedia ?? []).map((item) => {
                  const owner = ownerMap.get(item.user_id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <p className="text-xs text-amber-200/70">{item.media_type}</p>
                      <p className="mt-1 text-xs text-slate-300">{item.url}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Owner: {owner?.username ?? owner?.display_name ?? "Unknown"}
                      </p>
                      <form action={downloadMedia} className="mt-2">
                        <input type="hidden" name="bucket" value="posts" />
                        <input type="hidden" name="path" value={item.url} />
                        <button
                          type="submit"
                          className="text-xs uppercase tracking-[0.3em] text-amber-200/70"
                        >
                          Download
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200/10 bg-black/60 p-6">
          <h2 className="text-lg font-semibold text-white">Reports queue</h2>
          {reports?.length ? (
            <div className="mt-4 space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-amber-100">
                      {report.target_type} · {report.status}
                    </p>
                    <form action={resolveReport} className="flex gap-2">
                      <input type="hidden" name="reportId" value={report.id} />
                      <button
                        type="submit"
                        name="status"
                        value="reviewed"
                        className="rounded-full border border-amber-200/40 px-3 py-1 text-xs text-amber-100"
                      >
                        Mark reviewed
                      </button>
                      <button
                        type="submit"
                        name="status"
                        value="closed"
                        className="rounded-full border border-emerald-300/40 px-3 py-1 text-xs text-emerald-200"
                      >
                        Close
                      </button>
                    </form>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{report.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No reports in the queue.</p>
          )}
        </section>

        <section className="rounded-3xl border border-amber-200/10 bg-black/60 p-6">
          <h2 className="text-lg font-semibold text-white">Rewards management</h2>
          <form action={createReward} className="mt-4 grid gap-3 md:grid-cols-4">
            <input
              name="title"
              placeholder="Reward title"
              className="rounded-full border border-slate-700 bg-black/50 px-4 py-2 text-sm text-slate-200"
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-full border border-slate-700 bg-black/50 px-4 py-2 text-sm text-slate-200"
            />
            <input
              name="pointsCost"
              type="number"
              min={1}
              placeholder="Points"
              className="rounded-full border border-slate-700 bg-black/50 px-4 py-2 text-sm text-slate-200"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-200/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-100"
            >
              Add reward
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {(rewards ?? []).map((reward) => (
              <div
                key={reward.id}
                className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 md:grid-cols-5"
              >
                <form action={updateReward} className="contents">
                  <input type="hidden" name="rewardId" value={reward.id} />
                  <input
                    name="title"
                    defaultValue={reward.title}
                    className="rounded-full border border-slate-700 bg-black/50 px-3 py-1 text-xs text-slate-200"
                  />
                  <input
                    name="description"
                    defaultValue={reward.description ?? ""}
                    className="rounded-full border border-slate-700 bg-black/50 px-3 py-1 text-xs text-slate-200"
                  />
                  <input
                    name="pointsCost"
                    type="number"
                    min={1}
                    defaultValue={reward.points_cost}
                    className="rounded-full border border-slate-700 bg-black/50 px-3 py-1 text-xs text-slate-200"
                  />
                  <select
                    name="isActive"
                    defaultValue={reward.is_active ? "true" : "false"}
                    className="rounded-full border border-slate-700 bg-black/50 px-3 py-1 text-xs text-slate-200"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full border border-amber-200/40 px-3 py-1 text-xs text-amber-100"
                  >
                    Save
                  </button>
                </form>
                <form action={deleteReward} className="md:col-span-5">
                  <input type="hidden" name="rewardId" value={reward.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200/10 bg-black/60 p-6">
          <h2 className="text-lg font-semibold text-white">Redemptions</h2>
          {redemptions?.length ? (
            <div className="mt-4 space-y-3">
              {redemptions.map((redemption) => {
                const reward = rewardMap.get(redemption.reward_id);
                const redeemer = redemptionUserMap.get(redemption.user_id);
                return (
                  <div
                    key={redemption.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-amber-100">
                          {reward?.title ?? "Reward"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Requested by {redeemer?.username ?? "user"}
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                        {redemption.status}
                      </span>
                    </div>
                    <form action={reviewRedemption} className="mt-3 flex gap-2">
                      <input type="hidden" name="redemptionId" value={redemption.id} />
                      <button
                        type="submit"
                        name="decision"
                        value="approve"
                        className="rounded-full border border-emerald-300/40 px-3 py-1 text-xs text-emerald-200"
                      >
                        Approve
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="deny"
                        className="rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200"
                      >
                        Deny
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No redemptions pending.</p>
          )}
        </section>

        <section className="rounded-3xl border border-amber-200/10 bg-black/60 p-6">
          <h2 className="text-lg font-semibold text-white">Audit log</h2>
          {auditLog?.length ? (
            <div className="mt-4 space-y-2 text-xs text-slate-300">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex flex-wrap gap-2">
                  <span className="text-amber-200/70">{entry.action}</span>
                  <span>{entry.target_type}</span>
                  <span className="text-slate-500">{entry.target_id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No admin actions yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
