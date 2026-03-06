import { createAdminClient } from "@/utils/supabase/admin";

export default async function UsersPage() {
  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select(
      "id,email,first_name,last_name,is_superadmin,is_in_study,is_matrix_admin,created_datetime_utc,modified_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <header>
        <h1 style={styles.h1}>Users / Profiles</h1>
        <p style={styles.subtle}>Read-only list of profiles.</p>
      </header>

      {error && <div style={styles.error}>Error: {error.message}</div>}

      <div style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>id</th>
                <th style={styles.th}>email</th>
                <th style={styles.th}>name</th>
                <th style={styles.th}>is_superadmin</th>
                <th style={styles.th}>created_datetime_utc</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p: any) => (
                <tr key={p.id}>
                  <td style={styles.tdMono}>{p.id}</td>
                  <td style={styles.td}>{p.email ?? "—"}</td>
                  <td style={styles.td}>
                    {(p.first_name || p.last_name) ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "—"}
                  </td>
                  <td style={styles.td}>{String(!!p.is_superadmin)}</td>
                  <td style={styles.td}>
                    {p.created_datetime_utc ? new Date(p.created_datetime_utc).toLocaleString() : "—"}
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
  td: {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 13.5,
  },
  tdMono: {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12.5,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};