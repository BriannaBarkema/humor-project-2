import { createAdminClient } from "@/utils/supabase/admin";

function trunc(s: string | null | undefined, n: number) {
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default async function HumorFlavorStepsPage() {
    const admin = createAdminClient();

    const { data: steps, error } = await admin
        .from("humor_flavor_steps")
        .select(
            [
                "id",
                "created_datetime_utc",
                "humor_flavor_id",
                "order_by",
                "llm_temperature",
                "llm_input_type_id",
                "llm_output_type_id",
                "llm_model_id",
                "humor_flavor_step_type_id",
                "description",
                "llm_system_prompt",
                "llm_user_prompt",
            ].join(",")
        )
        .order("humor_flavor_id", { ascending: true })
        .order("order_by", { ascending: true })
        .limit(1000);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>Humor flavor steps</h1>
                <p style={styles.subtle}>
                    Read-only view of the step chain per humor flavor. Ordered by{" "}
                    <code>humor_flavor_id</code> then <code>order_by</code>.
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
                            <th style={styles.th}>order_by</th>
                            <th style={styles.th}>step_type_id</th>
                            <th style={styles.th}>model_id</th>
                            <th style={styles.th}>temp</th>
                            <th style={styles.th}>in_type</th>
                            <th style={styles.th}>out_type</th>
                            <th style={styles.th}>description</th>
                            <th style={styles.th}>system_prompt</th>
                            <th style={styles.th}>user_prompt</th>
                            <th style={styles.th}>created</th>
                        </tr>
                        </thead>

                        <tbody>
                        {(steps ?? []).map((s: any) => (
                            <tr key={s.id}>
                                <td style={styles.tdMono}>{s.id}</td>
                                <td style={styles.tdMono}>{s.humor_flavor_id}</td>
                                <td style={styles.td}>{s.order_by}</td>
                                <td style={styles.tdMono}>{s.humor_flavor_step_type_id}</td>
                                <td style={styles.tdMono}>{s.llm_model_id}</td>
                                <td style={styles.td}>{s.llm_temperature ?? "—"}</td>
                                <td style={styles.tdMono}>{s.llm_input_type_id}</td>
                                <td style={styles.tdMono}>{s.llm_output_type_id}</td>

                                <td style={styles.td}>
                                    {s.description ? (
                                        <div style={styles.cellWrap} title={s.description}>
                                            {trunc(s.description, 90)}
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>(none)</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {s.llm_system_prompt ? (
                                        <div style={styles.cellWrap} title={s.llm_system_prompt}>
                                            {trunc(s.llm_system_prompt, 120)}
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>(none)</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {s.llm_user_prompt ? (
                                        <div style={styles.cellWrap} title={s.llm_user_prompt}>
                                            {trunc(s.llm_user_prompt, 120)}
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>(none)</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {s.created_datetime_utc
                                        ? new Date(s.created_datetime_utc).toLocaleString()
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                    Total shown: {steps?.length ?? 0}
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
    cellWrap: {
        maxWidth: 360,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};