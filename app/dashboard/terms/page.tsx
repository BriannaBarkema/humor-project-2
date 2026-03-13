import { createAdminClient } from "@/utils/supabase/admin";
import { createTerm } from "./actions";
import TermsTableClient from "./TermsTableClient";

export default async function TermsPage() {
    const admin = createAdminClient();

    const { data: termTypes } = await admin
        .from("term_types")
        .select("id,slug,description")
        .order("id", { ascending: true });

    const { data: terms, error } = await admin
        .from("terms")
        .select("id,created_datetime_utc,modified_datetime_utc,term,definition,example,priority,term_type_id")
        .order("priority", { ascending: false })
        .order("id", { ascending: false })
        .limit(500);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>Terms</h1>
                <p style={styles.subtle}>Create / read / update / delete glossary terms.</p>
            </header>

            {/* Create */}
            <div style={styles.card}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Create term</div>
                <form action={createTerm} style={styles.createForm}>
                    <input name="term" placeholder="term (required)" style={styles.input} />

                    <input
                        name="priority"
                        defaultValue="0"
                        placeholder="priority (smallint)"
                        style={styles.inputSmall}
                    />

                    <input
                        name="term_type_id"
                        placeholder="term_type_id (optional)"
                        style={styles.inputSmall}
                        title="smallint; references term_types.id"
                    />

                    <textarea name="definition" placeholder="definition (required)" style={styles.textarea} />
                    <textarea name="example" placeholder="example (required)" style={styles.textarea} />

                    <button type="submit" style={styles.btnPrimary}>
                        Create
                    </button>
                </form>

                {termTypes && termTypes.length > 0 && (
                    <div style={{ marginTop: 12, opacity: 0.75, fontSize: 12 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>term_type_id reference</div>
                        <div style={styles.typeGrid}>
                            {termTypes.slice(0, 24).map((t: any) => (
                                <div key={t.id} style={styles.typePill}>
                                    <span style={styles.mono}>{t.id}</span>
                                    <span style={{ opacity: 0.85 }}>{t.slug ?? t.description ?? "(no label)"}</span>
                                </div>
                            ))}
                            {termTypes.length > 24 && <div style={{ opacity: 0.7 }}>…and {termTypes.length - 24} more</div>}
                        </div>
                    </div>
                )}
            </div>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            {/* List + row editing */}
            <TermsTableClient terms={(terms ?? []) as any} termTypes={(termTypes ?? []) as any} />
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
        gridTemplateColumns: "1fr 160px 220px",
        gap: 10,
        alignItems: "start",
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

    textarea: {
        gridColumn: "1 / -1",
        width: "100%",
        minHeight: 90,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        resize: "vertical",
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

    typeGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
    typePill: {
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