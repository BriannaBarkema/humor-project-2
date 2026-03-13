import { createAdminClient } from "@/utils/supabase/admin";
import { updateHumorFlavorMix } from "./actions";

export default async function HumorFlavorMixPage() {
    const admin = createAdminClient();

    // Helpful for display + allows you to pick valid IDs when editing
    const { data: flavors } = await admin
        .from("humor_flavors")
        .select("id,slug")
        .order("id", { ascending: true });

    const { data: mixRows, error } = await admin
        .from("humor_flavor_mix")
        .select("id,created_datetime_utc,humor_flavor_id,caption_count")
        .order("id", { ascending: true })
        .limit(2000);

    const slugById = new Map<number, string>();
    (flavors ?? []).forEach((f: any) => slugById.set(Number(f.id), String(f.slug)));

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>Humor flavor mix</h1>
                <p style={styles.subtle}>
                    Read + update <code>caption_count</code> per flavor. (And flavor id if needed.)
                </p>
            </header>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <div style={styles.card}>
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>id</th>
                            <th style={styles.th}>humor_flavor_id</th>
                            <th style={styles.th}>flavor slug</th>
                            <th style={styles.th}>caption_count</th>
                            <th style={styles.th}>created_datetime_utc</th>
                            <th style={styles.th}>update</th>
                        </tr>
                        </thead>

                        <tbody>
                        {(mixRows ?? []).map((r: any) => {
                            const flavorId = Number(r.humor_flavor_id);
                            const slug = slugById.get(flavorId) ?? "—";

                            return (
                                <tr key={r.id}>
                                    <td style={styles.tdMono}>{r.id}</td>

                                    <td style={styles.td}>
                                        <form action={updateHumorFlavorMix} style={styles.inlineForm}>
                                            <input type="hidden" name="id" value={r.id} />

                                            <input
                                                name="humor_flavor_id"
                                                defaultValue={String(r.humor_flavor_id)}
                                                style={styles.inputSmall}
                                                title="humor_flavor_id"
                                            />

                                            <span style={styles.hint}>
                          (slug: <span style={styles.mono}>{slug}</span>)
                        </span>

                                            <input
                                                name="caption_count"
                                                defaultValue={String(r.caption_count)}
                                                style={styles.inputSmall}
                                                title="caption_count"
                                            />

                                            <button type="submit" style={styles.btnPrimary}>
                                                Save
                                            </button>
                                        </form>
                                    </td>

                                    <td style={styles.tdMono}>{slug}</td>

                                    <td style={styles.tdMono}>{r.caption_count}</td>

                                    <td style={styles.td}>
                                        {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleString() : "—"}
                                    </td>

                                    <td style={styles.td}>
                      <span style={{ opacity: 0.65, fontSize: 12 }}>
                        Edit fields in-row → Save
                      </span>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                    Total shown: {mixRows?.length ?? 0}
                </div>
            </div>

            <div style={styles.card}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Flavor ID reference</div>
                <div style={{ opacity: 0.75, fontSize: 13, marginBottom: 10 }}>
                    Use these to avoid updating <code>humor_flavor_id</code> to an invalid value.
                </div>

                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>id</th>
                            <th style={styles.th}>slug</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(flavors ?? []).map((f: any) => (
                            <tr key={f.id}>
                                <td style={styles.tdMono}>{f.id}</td>
                                <td style={styles.tdMono}>{f.slug}</td>
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

    inlineForm: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
        minWidth: 0,
    },

    inputSmall: {
        width: 120,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },

    btnPrimary: {
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "inherit",
        fontWeight: 900,
        cursor: "pointer",
        fontSize: 12.5,
    },

    hint: {
        opacity: 0.7,
        fontSize: 12,
        whiteSpace: "nowrap",
    },

    mono: {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
};