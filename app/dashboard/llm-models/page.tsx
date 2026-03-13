import { createAdminClient } from "@/utils/supabase/admin";
import { createLlmModel } from "./actions";
import LlmModelsTableClient from "./LlmModelsTableClient";

export default async function LlmModelsPage() {
    const admin = createAdminClient();

    // Reference list (if llm_providers exists)
    const { data: providers } = await admin
        .from("llm_providers")
        .select("id,name,slug")
        .order("id", { ascending: true });

    const { data: rows, error } = await admin
        .from("llm_models")
        .select("id,created_datetime_utc,name,llm_provider_id,provider_model_id,is_temperature_supported")
        .order("id", { ascending: true })
        .limit(1000);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>LLM models</h1>
                <p style={styles.subtle}>Create / read / update / delete supported LLM model entries.</p>
            </header>

            {/* Create */}
            <div style={styles.card}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Create LLM model</div>
                <form action={createLlmModel} style={styles.createForm}>
                    <input name="name" placeholder="name (required)" style={styles.input} />

                    <input
                        name="llm_provider_id"
                        placeholder="llm_provider_id (smallint)"
                        style={styles.inputSmall}
                        title="references llm_providers.id"
                    />

                    <input
                        name="provider_model_id"
                        placeholder="provider_model_id (required)"
                        style={styles.inputWide}
                    />

                    <label style={styles.checkLabel}>
                        <input type="checkbox" name="is_temperature_supported" />
                        <span>temperature supported</span>
                    </label>

                    <button type="submit" style={styles.btnPrimary}>
                        Create
                    </button>
                </form>

                {providers && providers.length > 0 && (
                    <div style={{ marginTop: 12, opacity: 0.75, fontSize: 12 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>llm_provider_id reference</div>
                        <div style={styles.refGrid}>
                            {providers.slice(0, 30).map((p: any) => (
                                <div key={p.id} style={styles.refPill}>
                                    <span style={styles.mono}>{p.id}</span>
                                    <span style={{ opacity: 0.85 }}>{p.slug ?? p.name ?? "(no label)"}</span>
                                </div>
                            ))}
                            {providers.length > 30 && <div style={{ opacity: 0.7 }}>…and {providers.length - 30} more</div>}
                        </div>
                    </div>
                )}
            </div>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <LlmModelsTableClient rows={(rows ?? []) as any} providers={(providers ?? []) as any} />
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

    createForm: {
        display: "grid",
        gridTemplateColumns: "1fr 200px 1fr",
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

    inputSmall: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },

    inputWide: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },

    checkLabel: {
        gridColumn: "1 / -1",
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        fontWeight: 900,
        fontSize: 12.5,
        opacity: 0.9,
        width: "fit-content",
    },

    btnPrimary: {
        gridColumn: "1 / -1",
        justifySelf: "start",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "inherit",
        fontWeight: 900,
        cursor: "pointer",
        width: 140,
    },

    refGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
    refPill: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
    },

    mono: {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
};