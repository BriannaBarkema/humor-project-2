import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

type CaptionRow = {
  id: string;
  image_id: string | null;
  content: string | null;
  like_count: number | null;
  is_public: boolean | null;
  is_featured: boolean | null;
  created_datetime_utc: string | null;
};

type VoteRow = {
  id: string;
  caption_id: string;
  vote_value: number | null;
  created_datetime_utc: string | null;
};

export default async function CaptionsPage() {
  const admin = createAdminClient();
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    captionsRes,
    totalCaptionsRes,
    publicCaptionsRes,
    featuredCaptionsRes,
    positiveCaptionsRes,
    ratingsCountRes,
    upvotesCountRes,
    downvotesCountRes,
    ratings7dRes,
    ratings30dRes,
    topCaptionsRes,
    lowestCaptionsRes,
    recentVotesRes,
  ] = await Promise.all([
    admin
      .from("captions")
      .select("id,content,is_public,is_featured,like_count,profile_id,image_id,created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(300),
    admin.from("captions").select("*", { count: "exact", head: true }),
    admin.from("captions").select("*", { count: "exact", head: true }).eq("is_public", true),
    admin.from("captions").select("*", { count: "exact", head: true }).eq("is_featured", true),
    admin.from("captions").select("*", { count: "exact", head: true }).gt("like_count", 0),
    admin.from("caption_votes").select("*", { count: "exact", head: true }),
    admin.from("caption_votes").select("*", { count: "exact", head: true }).eq("vote_value", 1),
    admin.from("caption_votes").select("*", { count: "exact", head: true }).eq("vote_value", -1),
    admin.from("caption_votes").select("*", { count: "exact", head: true }).gte("created_datetime_utc", sevenDaysAgo),
    admin.from("caption_votes").select("*", { count: "exact", head: true }).gte("created_datetime_utc", thirtyDaysAgo),
    admin
      .from("captions")
      .select("id,content,like_count,image_id,is_public,is_featured,created_datetime_utc")
      .order("like_count", { ascending: false })
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    admin
      .from("captions")
      .select("id,content,like_count,image_id,is_public,is_featured,created_datetime_utc")
      .order("like_count", { ascending: true })
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    admin
      .from("caption_votes")
      .select("id,caption_id,vote_value,created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(20),
  ]);

  const captions = (captionsRes.data ?? []) as CaptionRow[];
  const topCaptions = (topCaptionsRes.data ?? []) as CaptionRow[];
  const lowestCaptions = (lowestCaptionsRes.data ?? []) as CaptionRow[];
  const recentVotes = (recentVotesRes.data ?? []) as VoteRow[];

  const totalCaptions = totalCaptionsRes.count ?? captions.length;
  const publicCaptions = publicCaptionsRes.count ?? captions.filter((c) => !!c.is_public).length;
  const featuredCaptions = featuredCaptionsRes.count ?? captions.filter((c) => !!c.is_featured).length;
  const positiveCaptions = positiveCaptionsRes.count ?? captions.filter((c) => Number(c.like_count ?? 0) > 0).length;
  const totalRatings = ratingsCountRes.count ?? 0;
  const upvotes = upvotesCountRes.count ?? 0;
  const downvotes = downvotesCountRes.count ?? 0;
  const ratings7d = ratings7dRes.count ?? 0;
  const ratings30d = ratings30dRes.count ?? 0;

  const sampledScoreTotal = captions.reduce((sum, c) => sum + Number(c.like_count ?? 0), 0);
  const averageScore = captions.length ? sampledScoreTotal / captions.length : 0;
  const averageRatingsPerCaption = totalCaptions ? totalRatings / totalCaptions : 0;
  const publicRate = totalCaptions ? (publicCaptions / totalCaptions) * 100 : 0;
  const positiveRate = totalCaptions ? (positiveCaptions / totalCaptions) * 100 : 0;
  const upvoteShare = totalRatings ? (upvotes / totalRatings) * 100 : 0;

  let recentVoteCaptions: CaptionRow[] = [];
  let recentVoteCaptionsError: string | null = null;

  if (!recentVotesRes.error && recentVotes.length > 0) {
    const recentCaptionIds = Array.from(new Set(recentVotes.map((vote) => vote.caption_id).filter(Boolean)));

    if (recentCaptionIds.length > 0) {
      const { data, error } = await admin
        .from("captions")
        .select("id,content,like_count,image_id,is_public,is_featured,created_datetime_utc")
        .in("id", recentCaptionIds);

      recentVoteCaptions = (data ?? []) as CaptionRow[];
      recentVoteCaptionsError = error?.message ?? null;
    }
  }

  const recentVoteCaptionMap = new Map(recentVoteCaptions.map((caption) => [caption.id, caption]));

  const ratingError =
    ratingsCountRes.error?.message ??
    upvotesCountRes.error?.message ??
    downvotesCountRes.error?.message ??
    ratings7dRes.error?.message ??
    ratings30dRes.error?.message ??
    recentVotesRes.error?.message ??
    recentVoteCaptionsError;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <header style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>Captions</h1>
          <p style={styles.subtle}>
            Caption inventory plus rating statistics to help you monitor what users are reacting to.
          </p>
        </div>
        <Link href="/dashboard" style={styles.linkBtn}>
          Back to overview
        </Link>
      </header>

      <section style={styles.statsGrid}>
        <StatCard title="Total captions" value={formatWholeNumber(totalCaptions)} helper="All caption rows" />
        <StatCard
          title="Total ratings"
          value={formatWholeNumber(totalRatings)}
          helper={ratingError ? "caption_votes unavailable" : "All recorded votes"}
        />
        <StatCard title="Ratings / caption" value={formatDecimal(averageRatingsPerCaption)} helper="Average engagement" />
        <StatCard title="Avg net score" value={formatDecimal(averageScore)} helper="Based on like_count sample" />
        <StatCard title="Public captions" value={`${formatWholeNumber(publicCaptions)} (${formatPercent(publicRate)})`} helper="Visible to users" />
        <StatCard title="Featured captions" value={formatWholeNumber(featuredCaptions)} helper="Marked featured" />
        <StatCard title="Positive captions" value={`${formatWholeNumber(positiveCaptions)} (${formatPercent(positiveRate)})`} helper="like_count &gt; 0" />
        <StatCard title="Upvote share" value={formatPercent(upvoteShare)} helper={`${formatWholeNumber(upvotes)} up / ${formatWholeNumber(downvotes)} down`} />
      </section>

      <section style={styles.statsGrid}>
        <StatCard title="Ratings in last 7 days" value={formatWholeNumber(ratings7d)} helper="Recent activity" />
        <StatCard title="Ratings in last 30 days" value={formatWholeNumber(ratings30d)} helper="Recent activity" />
      </section>

      {captionsRes.error && <div style={styles.error}>Error loading captions: {captionsRes.error.message}</div>}
      {ratingError && (
        <div style={styles.warning}>
          Rating activity could not be fully loaded. Caption stats from the <code>captions</code> table still work, but
          vote-specific sections are partial. Error: {ratingError}
        </div>
      )}

      <section style={styles.twoCol}>
        <Panel title="Top captions by score" subtitle="Highest current like_count values.">
          <CaptionSummaryList captions={topCaptions} emptyLabel="No captions yet." />
        </Panel>

        <Panel title="Captions needing review" subtitle="Lowest current like_count values.">
          <CaptionSummaryList captions={lowestCaptions} emptyLabel="No captions yet." />
        </Panel>
      </section>

      <Panel title="Recent rating activity" subtitle="Newest user votes, paired with the caption they rated.">
        {recentVotes.length === 0 ? (
          <div style={styles.emptyState}>No recent rating activity to show.</div>
        ) : (
          <ul style={styles.list}>
            {recentVotes.map((vote) => {
              const caption = recentVoteCaptionMap.get(vote.caption_id);
              const isUpvote = Number(vote.vote_value ?? 0) > 0;

              return (
                <li key={vote.id} style={styles.activityItem}>
                  <div style={styles.votePill(isUpvote)}>{isUpvote ? "+1" : "-1"}</div>

                  <div style={styles.activityBody}>
                    <div style={styles.activityText} title={caption?.content ?? ""}>
                      {caption?.content ?? "Caption unavailable"}
                    </div>
                    <div style={styles.activityMeta}>
                      <span>caption {String(vote.caption_id).slice(0, 8)}…</span>
                      {caption ? <span>score {Number(caption.like_count ?? 0)}</span> : null}
                      <span>
                        {vote.created_datetime_utc ? new Date(vote.created_datetime_utc).toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <div style={{ fontWeight: 900 }}>All captions</div>
            <div style={styles.sectionSubtitle}>Detailed table for spot-checking rating performance and metadata.</div>
          </div>
          <div style={styles.tableCount}>Showing {formatWholeNumber(captions.length)} most recent rows</div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>id</th>
                <th style={styles.th}>image_id</th>
                <th style={styles.th}>content</th>
                <th style={styles.th}>score</th>
                <th style={styles.th}>visibility</th>
                <th style={styles.th}>featured</th>
                <th style={styles.th}>created_datetime_utc</th>
              </tr>
            </thead>
            <tbody>
              {captions.map((caption) => (
                <tr key={caption.id}>
                  <td style={styles.tdMono}>{caption.id}</td>
                  <td style={styles.tdMono}>{caption.image_id ?? "—"}</td>
                  <td style={styles.td}>
                    <div style={styles.truncate560} title={caption.content ?? ""}>
                      {caption.content ?? "(no content)"}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.scoreBadge(Number(caption.like_count ?? 0))}>{Number(caption.like_count ?? 0)}</span>
                  </td>
                  <td style={styles.td}>{caption.is_public ? "public" : "private"}</td>
                  <td style={styles.td}>{caption.is_featured ? "featured" : "—"}</td>
                  <td style={styles.td}>
                    {caption.created_datetime_utc ? new Date(caption.created_datetime_utc).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div style={styles.card}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statHelper}>{helper}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={{ fontWeight: 900 }}>{title}</div>
          {subtitle ? <div style={styles.sectionSubtitle}>{subtitle}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function CaptionSummaryList({ captions, emptyLabel }: { captions: CaptionRow[]; emptyLabel: string }) {
  if (!captions.length) return <div style={styles.emptyState}>{emptyLabel}</div>;

  return (
    <ul style={styles.list}>
      {captions.map((caption) => (
        <li key={caption.id} style={styles.listItem}>
          <div style={styles.idPill}>{String(caption.id).slice(0, 8)}…</div>
          <div style={styles.flexTruncate} title={caption.content ?? ""}>
            {caption.content ?? "(no content)"}
          </div>
          <div style={styles.scoreBadge(Number(caption.like_count ?? 0))}>{Number(caption.like_count ?? 0)}</div>
        </li>
      ))}
    </ul>
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

const styles: Record<string, any> = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 12,
    flexWrap: "wrap",
  },
  h1: { margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.3 },
  subtle: { margin: "6px 0 0 0", opacity: 0.75, maxWidth: 760 },
  linkBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 800,
    fontSize: 13.5,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  error: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.08)",
  },
  warning: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,190,80,0.35)",
    background: "rgba(255,190,80,0.08)",
  },
  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.22)",
    overflow: "hidden",
  },
  statTitle: { opacity: 0.75, fontSize: 12.5, fontWeight: 800 },
  statValue: { marginTop: 6, fontSize: 28, fontWeight: 950, letterSpacing: -0.5 },
  statHelper: { marginTop: 6, opacity: 0.7, fontSize: 12.5 },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 10,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  sectionSubtitle: { marginTop: 4, opacity: 0.72, fontSize: 12.5 },
  tableCount: { opacity: 0.7, fontSize: 12.5 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    opacity: 0.75,
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  td: { padding: "10px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13.5 },
  tdMono: {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12.5,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  truncate560: {
    maxWidth: 560,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
  activityItem: {
    display: "flex",
    alignItems: "start",
    gap: 12,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
  },
  activityBody: { minWidth: 0, flex: "1 1 auto", display: "grid", gap: 4 },
  activityText: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 13.5,
  },
  activityMeta: {
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
    padding: "8px 0",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12.5,
    border: isUpvote ? "1px solid rgba(120,255,170,0.22)" : "1px solid rgba(255,120,120,0.24)",
    background: isUpvote ? "rgba(120,255,170,0.10)" : "rgba(255,120,120,0.10)",
  }),
  idPill: { flex: "0 0 auto", fontWeight: 900, opacity: 0.95 },
  flexTruncate: {
    minWidth: 0,
    flex: "1 1 auto",
    opacity: 0.8,
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  scoreBadge: (score: number) => ({
    flex: "0 0 auto",
    marginLeft: "auto",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12.5,
    whiteSpace: "nowrap",
    border:
      score > 0
        ? "1px solid rgba(120,255,170,0.22)"
        : score < 0
          ? "1px solid rgba(255,120,120,0.24)"
          : "1px solid rgba(255,255,255,0.14)",
    background:
      score > 0
        ? "rgba(120,255,170,0.10)"
        : score < 0
          ? "rgba(255,120,120,0.10)"
          : "rgba(255,255,255,0.04)",
  }),
  emptyState: { opacity: 0.72, fontSize: 13.5 },
};
