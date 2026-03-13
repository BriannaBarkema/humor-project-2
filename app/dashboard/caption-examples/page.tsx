import { createAdminClient } from "@/utils/supabase/admin";
import { createCaptionExample } from "./actions";
import CaptionExamplesTableClient from "./CaptionExamplesTableClient";

export default async function CaptionExamplesPage() {
    const admin = createAdminClient();

    const { data: rows, error } = await admin
        .from("caption_examples")
        .select(
            "id,created_datetime_utc,modified_datetime_utc,image_description,caption,explanation,priority,image_id"
        )
        .order("priority", { ascending: false })
        .order("id", { ascending: false })
        .limit(500);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>Caption examples</h1>
                <p style={styles.subtle}>Create / read / update / delete caption examples.</p>
            </header>

            {/* Create */}
            <div style={styles.card}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Create caption example</div>
                <form action={createCaptionExample} style={styles.createForm}>
                    <input
                        name="priority"
                        defaultValue="0"
                        placeholder="priority (smallint)"
                        style={styles.inputTiny}
                    />

                    <input
                        name="image_id"
                        placeholder="image_id (optional uuid)"
                        style={styles.inputUuid}
                    />

                    <textarea
                        name="image_description"
                        placeholder="image_description (required)"
                        style={styles.textarea}
                    />

                    <textarea name="caption" placeholder="caption (required)" style={styles.textarea} />

                    <textarea
                        name="explanation"
                        placeholder="explanation (required)"
                        style={styles.textarea}
                    />

                    <button type="submit" style={styles.btnPrimary}>
                        Create
                    </button>
                </form>
            </div>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <CaptionExamplesTableClient rows={(rows ?? []) as any} />
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
        gridTemplateColumns: "120px 1fr",
        gap: 10,
        alignItems: "start",
    },

    inputTiny: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },

    inputUuid: {
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
};