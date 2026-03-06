import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function DashboardHome() {
  const admin = createAdminClient();

  const [{ count: usersCount }, { count: imagesCount }, { count: captionsCount }] =
    await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("images").select("*", { count: "exact", head: true }),
      admin.from("captions").select("*", { count: "exact", head: true }),
    ]);

  const { data: recentImages } = await admin
    .from("images")
    .select("id,url,created_datetime_utc,is_public,is_common_use,profile_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(5);

  const { data: recentCaptions } = await admin
    .from("captions")
    .select("id,content,created_datetime_utc,like_count,image_id,profile_id,is_featured")
    .order("created_datetime_utc", { ascending: false })
    .limit(5);

  const { data: topCaptions } = await admin
    .from("captions")
    .select("id,content,like_count,created_datetime_utc,image_id")
    .order("like_count", { ascending: false })
    .limit(5);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.3 }}>
            Dashboard
          </h1>
          <p style={{ margin: "6px 0 0 0", opacity: 0.75 }}>
            Quick stats + recent activity from your database.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <QuickLink href="/dashboard/images" label="Manage images" />
          <QuickLink href="/dashboard/users" label="View users" />
        </div>
      </header>

      <section style={styles.grid3}>
        <StatCard title="Users / Profiles" value={usersCount ?? 0} />
        <StatCard title="Images" value={imagesCount ?? 0} />
        <StatCard title="Captions" value={captionsCount ?? 0} />
      </section>

      <section style={styles.grid2}>
        <Panel title="Recent images">
          <ul style={styles.list}>
            {(recentImages ?? []).map((img: any) => (
              <li key={img.id} style={styles.listItem}>
                <div style={styles.idPill}>{String(img.id).slice(0, 8)}…</div>

                <div style={styles.flexTruncate}>{img.url ?? "(no url)"}</div>

                <div style={styles.rightMeta}>
                  <div style={styles.timeText}>
                    {img.created_datetime_utc
                      ? new Date(img.created_datetime_utc).toLocaleString()
                      : "—"}
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
            {(recentCaptions ?? []).map((c: any) => (
              <li key={c.id} style={styles.listItem}>
                <div style={styles.idPill}>{String(c.id).slice(0, 8)}…</div>

                <div
                  style={{
                    ...styles.flexTruncate,
                    opacity: 0.85,
                  }}
                  title={c.content ?? ""}
                >
                  {c.content ?? "(no content)"}
                </div>

                <div style={styles.likes}>
                  ❤️ {c.like_count ?? 0}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section>
        <div style={styles.card}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Top captions (by like_count)</div>
          <ul style={styles.list}>
            {(topCaptions ?? []).map((c: any) => (
              <li key={c.id} style={styles.listItem}>
                <div style={styles.idPill}>{String(c.id).slice(0, 8)}…</div>

                <div
                  style={{
                    ...styles.flexTruncate,
                    opacity: 0.85,
                  }}
                  title={c.content ?? ""}
                >
                  {c.content ?? "(no content)"}
                </div>

                <div style={styles.likes}>
                  ❤️ {c.like_count ?? 0}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.card}>
      <div style={{ opacity: 0.75, fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.6, marginTop: 4 }}>
        {value}
      </div>
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

const styles: Record<string, React.CSSProperties> = {
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.22)",
    overflow: "hidden", // extra safety
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

    // IMPORTANT: prevents bleed in flex rows
    minWidth: 0,
    overflow: "hidden",
  },

  idPill: {
    flex: "0 0 auto",
    fontWeight: 900,
    opacity: 0.95,
  },

  flexTruncate: {
    // IMPORTANT: allows ellipsis to work inside flex
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
};