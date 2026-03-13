import { createAdminClient } from "@/utils/supabase/admin";

export default async function CaptionRequestsPage() {
    const admin = createAdminClient();

    const { data: requests, error } = await admin
        .from("caption_requests")
        .select("id,created_datetime_utc,profile_id,image_id")
        .order("created_datetime_utc", { ascending: false })
        .limit(1000);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>Caption requests</h1>
                <p style={styles.subtle}>Read-only list of caption request rows.</p>
            </header>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <div style={styles.card}>
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>id</th>
                            <th style={styles.th}>created_datetime_utc</th>
                            <th style={styles.th}>profile_id</th>
                            <th style={styles.th}>image_id</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(requests ?? []).map((r: any) => (
                            <tr key={r.id}>
                                <td style={styles.tdMono}>{r.id}</td>
                                <td style={styles.td}>
                                    {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleString() : "—"}
                                </td>
                                <td style={styles.tdMono}>{r.profile_id}</td>
                                <td style={styles.tdMono}>{r.image_id}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                    Total shown: {requests?.length ?? 0}
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
        overflow: "hidden",
    },

    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },

    th: {
        textAlign: "left",
        fontSize: 12,
        opacity: 0.75,
        padding: "10px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        whiteSpace: "nowrap",
    },

    td: {
        padding: "10px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: 13.5,
        verticalAlign: "top",
    },

    tdMono: {
        padding: "10px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: 12.5,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        verticalAlign: "top",
        whiteSpace: "nowrap",
    },
};