import { createAdminClient } from "@/utils/supabase/admin";

function trunc(s: string | null | undefined, n: number) {
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default async function LlmResponsesPage() {
    const admin = createAdminClient();

    const { data: rows, error } = await admin
        .from("llm_model_responses")
        .select(
            [
                "id",
                "created_datetime_utc",
                "processing_time_seconds",
                "llm_model_id",
                "profile_id",
                "caption_request_id",
                "humor_flavor_id",
                "llm_prompt_chain_id",
                "humor_flavor_step_id",
                "llm_temperature",
                "llm_system_prompt",
                "llm_user_prompt",
                "llm_model_response",
            ].join(",")
        )
        .order("created_datetime_utc", { ascending: false })
        .limit(400);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>LLM responses</h1>
                <p style={styles.subtle}>
                    Read-only view of model prompts/responses. Showing most recent 400 rows.
                </p>
            </header>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <div style={styles.card}>
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>created</th>
                            <th style={styles.th}>id</th>
                            <th style={styles.th}>model_id</th>
                            <th style={styles.th}>temp</th>
                            <th style={styles.th}>time_s</th>
                            <th style={styles.th}>profile_id</th>
                            <th style={styles.th}>caption_request_id</th>
                            <th style={styles.th}>humor_flavor_id</th>
                            <th style={styles.th}>prompt_chain_id</th>
                            <th style={styles.th}>step_id</th>
                            <th style={styles.th}>system_prompt</th>
                            <th style={styles.th}>user_prompt</th>
                            <th style={styles.th}>response</th>
                        </tr>
                        </thead>

                        <tbody>
                        {(rows ?? []).map((r: any) => (
                            <tr key={r.id}>
                                <td style={styles.td}>
                                    {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleString() : "—"}
                                </td>

                                <td style={styles.tdMono}>{r.id}</td>

                                <td style={styles.tdMono}>{r.llm_model_id}</td>

                                <td style={styles.td}>{r.llm_temperature ?? "—"}</td>

                                <td style={styles.tdMono}>{r.processing_time_seconds}</td>

                                <td style={styles.tdMono}>{r.profile_id}</td>

                                <td style={styles.tdMono}>{r.caption_request_id}</td>

                                <td style={styles.tdMono}>{r.humor_flavor_id}</td>

                                <td style={styles.tdMono}>{r.llm_prompt_chain_id ?? "—"}</td>

                                <td style={styles.tdMono}>{r.humor_flavor_step_id ?? "—"}</td>

                                <td style={styles.td}>
                                    {r.llm_system_prompt ? (
                                        <div style={styles.cellWrap} title={r.llm_system_prompt}>
                                            {trunc(r.llm_system_prompt, 140)}
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>(none)</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {r.llm_user_prompt ? (
                                        <div style={styles.cellWrap} title={r.llm_user_prompt}>
                                            {trunc(r.llm_user_prompt, 140)}
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>(none)</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {r.llm_model_response ? (
                                        <div style={styles.cellWrapWide} title={r.llm_model_response}>
                                            {trunc(r.llm_model_response, 220)}
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.6 }}>(none)</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                    Total shown: {rows?.length ?? 0}
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

    cellWrapWide: {
        maxWidth: 520,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};