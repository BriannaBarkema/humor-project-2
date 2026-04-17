import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number | null;
  created_datetime_utc: string | null;
  image_id: string | null;
};

type VoteRow = {
  id: string;
  caption_id: string;
  vote_value: number | null;
  created_datetime_utc: string | null;
};

export default async function DashboardHome() {
  const admin = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersCountRes,
    imagesCountRes,
    captionsCountRes,
    publicCaptionsCountRes,
    totalRatingsRes,
    ratings7dRes,
    recentImagesRes,
    recentCaptionsRes,
    topCaptionsRes,
    recentVotesRes,
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("images").select("*", { count: "exact", head: true }),
    admin.from("captions").select("*", { count: "exact", head: true }),
    admin.from("captions").select("*", { count: "exact", head: true }).eq("is_public", true),
    admin.from("caption_votes").select("*", { count: "exact", head: true }),
    admin.from("caption_votes").select("*", { count: "exact", head: true }).gte("created_datetime_utc", sevenDaysAgo),
    admin
      .from("images")
      .select("id,url,created_datetime_utc,is_public,is_common_use,profile_id")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    admin
      .from("captions")
      .select("id,content,created_datetime_utc,like_count,image_id,profile_id,is_featured")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    admin
      .from("captions")
      .select("id,content,like_count,created_datetime_utc,image_id")
      .order("like_count", { ascending: false })
      .limit(5),
    admin
      .from("caption_votes")
      .select("id,caption_id,vote_value,created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(8),
  ]);

  const usersCount = usersCountRes.count ?? 0;
  const imagesCount = imagesCountRes.count ?? 0;
  const captionsCount = captionsCountRes.count ?? 0;
  const publicCaptionsCount = publicCaptionsCountRes.count ?? 0;
  const totalRatings = totalRatingsRes.count ?? 0;
  const ratings7d = ratings7dRes.count ?? 0;

  const recentImages = recentImagesRes.data ?? [];
  const recentCaptions = (recentCaptionsRes.data ?? []) as CaptionRow[];
  const topCaptions = (topCaptionsRes.data ?? []) as CaptionRow[];
  const recentVotes = (recentVotesRes.data ?? []) as VoteRow[];

  const averageRatingsPerCaption = captionsCount ? totalRatings / captionsCount : 0;
  const publicCaptionShare = captionsCount ? (publicCaptionsCount / captionsCount) * 100 : 0;

  let recentVoteCaptions: CaptionRow[] = [];
  let ratingError: string | null =
    totalRatingsRes.error?.message ?? ratings7dRes.error?.message ?? recentVotesRes.error?.message ?? null;

  if (!ratingError && recentVotes.length > 0) {
    const ids = Array.from(new Set(recentVotes.map((vote) => vote.caption_id).filter(Boolean)));

    if (ids.length > 0) {
      const { data, error } = await admin
        .from("captions")
        .select("id,content,like_count,created_datetime_utc,image_id")
        .in("id", ids);

      recentVoteCaptions = (data ?? []) as CaptionRow[];
      ratingError = error?.message ?? null;
    }
  }

  const recentVoteCaptionMap = new Map(recentVoteCaptions.map((caption) => [caption.id, caption]));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.3 }}>Dashboard</h1>
          <p style={{ margin: "6px 0 0 0", opacity: 0.75 }}>
            Quick stats, caption rating signals, and recent activity from your database.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <QuickLink href="/dashboard/captions" label="Caption stats" />
          <QuickLink href="/dashboard/images" label="Manage images" />
          <QuickLink href="/dashboard/users" label="View users" />
        </div>
      </header>

      <section style={styles.grid3}>
        <StatCard title="Users / Profiles" value={formatWholeNumber(usersCount)} helper="Registered profiles" />
        <StatCard title="Images" value={formatWholeNumber(imagesCount)} helper="Uploaded image rows" />
        <StatCard title="Captions" value={formatWholeNumber(captionsCount)} helper="Generated caption rows" />
      </section>

      <section style={styles.grid4}>
        <StatCard title="Total ratings" value={formatWholeNumber(totalRatings)} helper={ratingError ? "caption_votes unavailable" : "All recorded votes"} />
        <StatCard title="Ratings in last 7 days" value={formatWholeNumber(ratings7d)} helper="Recent rating activity" />
        <StatCard title="Ratings / caption" value={formatDecimal(averageRatingsPerCaption)} helper="Average engagement" />
        <StatCard title="Public captions" value={`${formatWholeNumber(publicCaptionsCount)} (${formatPercent(publicCaptionShare)})`} helper="Visible to users" />
      </section>

      {ratingError && (
        <div style={styles.warning}>
          Some rating-specific data could not be loaded. Overview counts still work, but vote activity may be partial.
          Error: {ratingError}
        </div>
      )}

      <section style={styles.grid2}>
        <Panel title="Recent images">
          <ul style={styles.list}>
            {recentImages.map((img: any) => (
              <li key={img.id} style={styles.listItem}>
                <div style={styles.idPill}>{String(img.id).slice(0, 8)}…</div>

                <div style={styles.flexTruncate}>{img.url ?? "(no url)"}</div>

                <div style={styles.rightMeta}>
                  <div style={styles.timeText}>
                    {img.created_datetime_utc ? new Date(img.created_datetime_utc).toLocaleString() : "—"}
                  </div>
                  <Link href={`/dashboard/images/${img.id}`} style={styles.smallLink}>
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent captions">
          <ul style={styles.list}>
            {recentCaptions.map((caption) => (
              <li key={caption.id} style={styles.listItem}>
                <div style={styles.idPill}>{String(caption.id).slice(0, 8)}…</div>

                <div
                  style={{
                    ...styles.flexTruncate,
                    opacity: 0.85,
                  }}
                  title={caption.content ?? ""}
                >
                  {caption.content ?? "(no content)"}
                </div>

                <div style={styles.likes}>❤️ {caption.like_count ?? 0}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section style={styles.grid2}>
        <Panel title="Top captions (by like_count)">
          <ul style={styles.list}>
            {topCaptions.map((caption) => (
              <li key={caption.id} style={styles.listItem}>
                <div style={styles.idPill}>{String(caption.id).slice(0, 8)}…</div>

                <div
                  style={{
                    ...styles.flexTruncate,
                    opacity: 0.85,
                  }}
                  title={caption.content ?? ""}
                >
                  {caption.content ?? "(no content)"}
                </div>

                <div style={styles.likes}>❤️ {caption.like_count ?? 0}</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent rating activity">
          {recentVotes.length === 0 ? (
            <div style={styles.emptyState}>No recent votes to show.</div>
          ) : (
            <ul style={styles.list}>
              {recentVotes.map((vote) => {
                const caption = recentVoteCaptionMap.get(vote.caption_id);
                const isUpvote = Number(vote.vote_value ?? 0) > 0;

                return (
                  <li key={vote.id} style={styles.voteRow}>
                    <div style={styles.votePill(isUpvote)}>{isUpvote ? "+1" : "-1"}</div>
                    <div style={styles.voteBody}>
                      <div style={styles.flexTruncate} title={caption?.content ?? ""}>
                        {caption?.content ?? "Caption unavailable"}
                      </div>
                      <div style={styles.voteMeta}>
                        <span>{vote.created_datetime_utc ? new Date(vote.created_datetime_utc).toLocaleString() : "—"}</span>
                        {caption ? <span>score {caption.like_count ?? 0}</span> : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div style={styles.card}>
      <div style={{ opacity: 0.75, fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.6, marginTop: 4 }}>{value}</div>
      <div style={{ marginTop: 6, opacity: 0.7, fontSize: 12.5 }}>{helper}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.card}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={styles.quickLink}>
      {label}
    </Link>
  );
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

const styles: Record<string, React.CSSProperties | ((...args: any[]) => React.CSSProperties)> = {
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.22)",
    overflow: "hidden",
  },

  warning: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,190,80,0.35)",
    background: "rgba(255,190,80,0.08)",
  },

  quickLink: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 800,
    fontSize: 13.5,
  },

  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 },

  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    minWidth: 0,
    overflow: "hidden",
  },

  voteRow: {
    display: "flex",
    alignItems: "start",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
  },

  voteBody: { minWidth: 0, flex: "1 1 auto", display: "grid", gap: 4 },

  voteMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    opacity: 0.72,
    fontSize: 12.5,
  },

  votePill: (isUpvote: boolean) => ({
    flex: "0 0 auto",
    minWidth: 40,
    textAlign: "center",
    padding: "7px 0",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12.5,
    border: isUpvote ? "1px solid rgba(120,255,170,0.22)" : "1px solid rgba(255,120,120,0.24)",
    background: isUpvote ? "rgba(120,255,170,0.10)" : "rgba(255,120,120,0.10)",
  }),

  idPill: {
    flex: "0 0 auto",
    fontWeight: 900,
    opacity: 0.95,
  },

  flexTruncate: {
    minWidth: 0,
    flex: "1 1 auto",
    opacity: 0.75,
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  rightMeta: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
    minWidth: 0,
  },

  timeText: {
    opacity: 0.75,
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  smallLink: {
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
    opacity: 0.9,
    color: "inherit",
  },

  likes: {
    flex: "0 0 auto",
    marginLeft: "auto",
    opacity: 0.85,
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  emptyState: {
    opacity: 0.72,
    fontSize: 13.5,
  },
};
