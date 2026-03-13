import { createAdminClient } from "@/utils/supabase/admin";
import { createLlmProvider } from "./actions";
import LlmProvidersTableClient from "./LlmProvidersTableClient";

export default async function LlmProvidersPage() {
    const admin = createAdminClient();

    const { data: rows, error } = await admin
        .from("llm_providers")
        .select("id,created_datetime_utc,name")
        .order("id", { ascending: true })
        .limit(1000);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>LLM providers</h1>
                <p style={styles.subtle}>Create / read / update / delete LLM providers.</p>
            </header>

            {/* Create */}
            <div style={styles.card}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Create provider</div>
                <form action={createLlmProvider} style={styles.createForm}>
                    <input name="name" placeholder="name (required)" style={styles.input} />
                    <button type="submit" style={styles.btnPrimary}>
                        Create
                    </button>
                </form>
            </div>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <LlmProvidersTableClient rows={(rows ?? []) as any} />
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
        gridTemplateColumns: "1fr 140px",
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

    btnPrimary: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "inherit",
        fontWeight: 900,
        cursor: "pointer",
        width: 140,
    },
};