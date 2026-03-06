import { createAdminClient } from "@/utils/supabase/admin";

export default async function CaptionsPage() {
  const admin = createAdminClient();

  const { data: captions, error } = await admin
    .from("captions")
    .select("id,content,is_public,is_featured,like_count,profile_id,image_id,created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(300);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <header>
        <h1 style={styles.h1}>Captions</h1>
        <p style={styles.subtle}>Read-only view of caption rows.</p>
      </header>

      {error && <div style={styles.error}>Error: {error.message}</div>}

      <div style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>id</th>
                <th style={styles.th}>image_id</th>
                <th style={styles.th}>content</th>
                <th style={styles.th}>like_count</th>
                <th style={styles.th}>is_public</th>
                <th style={styles.th}>created_datetime_utc</th>
              </tr>
            </thead>
            <tbody>
              {(captions ?? []).map((c: any) => (
                <tr key={c.id}>
                  <td style={styles.tdMono}>{c.id}</td>
                  <td style={styles.tdMono}>{c.image_id}</td>
                  <td style={styles.td}>
                    <div style={{ maxWidth: 560, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.content ?? "(no content)"}
                    </div>
                  </td>
                  <td style={styles.td}>{c.like_count ?? 0}</td>
                  <td style={styles.td}>{String(!!c.is_public)}</td>
                  <td style={styles.td}>
                    {c.created_datetime_utc ? new Date(c.created_datetime_utc).toLocaleString() : "—"}
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

const styles: Record<string, React.CSSProperties> = {
  h1: { margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.3 },
  subtle: { margin: "6px 0 0 0", opacity: 0.75 },
  error: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.08)",
  },
  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
  },
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
};