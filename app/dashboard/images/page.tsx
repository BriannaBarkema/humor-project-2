import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createImage, deleteImage } from "./actions";

export default async function ImagesPage() {
  const admin = createAdminClient();

  const { data: images, error } = await admin
    .from("images")
    .select("id,url,created_datetime_utc,is_public,is_common_use,profile_id,additional_context")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <header>
        <h1 style={styles.h1}>Images</h1>
        <p style={styles.subtle}>Create, edit, and delete images.</p>
      </header>

      <div style={styles.card}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Create image</div>
        <form action={createImage} style={styles.formRow}>
          <input name="url" placeholder="url (required)" style={styles.input} />
          <label style={styles.checkLabel}>
            <input type="checkbox" name="is_public" />
            <span>is_public</span>
          </label>
          <label style={styles.checkLabel}>
            <input type="checkbox" name="is_common_use" />
            <span>is_common_use</span>
          </label>
          <button type="submit" style={styles.btnPrimary}>
            Create
          </button>

          <input
            name="additional_context"
            placeholder="additional_context (optional)"
            style={{ ...styles.input, gridColumn: "1 / -1" }}
          />
        </form>
      </div>

      {error && <div style={styles.error}>Error: {error.message}</div>}

      <div style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>id</th>
                <th style={styles.th}>url</th>
                <th style={styles.th}>is_public</th>
                <th style={styles.th}>is_common_use</th>
                <th style={styles.th}>created_datetime_utc</th>
                <th style={styles.th}>actions</th>
              </tr>
            </thead>
            <tbody>
              {(images ?? []).map((img: any) => (
                <tr key={img.id}>
                  <td style={styles.tdMono}>{img.id}</td>
                  <td style={styles.td}>
                    <div style={{ maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {img.url ?? "(no url)"}
                    </div>
                  </td>
                  <td style={styles.td}>{String(!!img.is_public)}</td>
                  <td style={styles.td}>{String(!!img.is_common_use)}</td>
                  <td style={styles.td}>
                    {img.created_datetime_utc ? new Date(img.created_datetime_utc).toLocaleString() : "—"}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Link href={`/dashboard/images/${img.id}`} style={styles.smallLink}>
                        Edit
                      </Link>
                      <form action={deleteImage}>
                        <input type="hidden" name="id" value={img.id} />
                        <button type="submit" style={styles.btnDanger}>
                          Delete
                        </button>
                      </form>
                    </div>
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
  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
  },
  error: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.08)",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 170px 140px",
    gap: 10,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
  },
  checkLabel: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.03)",
    fontWeight: 800,
    fontSize: 12.5,
    opacity: 0.9,
  },
  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,100,100,0.25)",
    background: "rgba(255,80,80,0.12)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
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
  smallLink: { textDecoration: "none", fontWeight: 950, fontSize: 13, color: "inherit", opacity: 0.9 },
};