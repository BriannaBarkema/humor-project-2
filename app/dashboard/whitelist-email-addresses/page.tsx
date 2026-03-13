import { createAdminClient } from "@/utils/supabase/admin";
import { createWhitelistEmail } from "./actions";
import WhitelistEmailsTableClient from "./WhitelistEmailsTableClient";

export default async function WhitelistEmailAddressesPage() {
    const admin = createAdminClient();

    const { data: rows, error } = await admin
        .from("whitelist_email_addresses")
        .select("id,created_datetime_utc,modified_datetime_utc,email_address")
        .order("id", { ascending: true })
        .limit(3000);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <header>
                <h1 style={styles.h1}>Whitelisted email addresses</h1>
                <p style={styles.subtle}>Create / read / update / delete whitelisted emails.</p>
            </header>

            {/* Create */}
            <div style={styles.card}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Add email</div>
                <form action={createWhitelistEmail} style={styles.createForm}>
                    <input name="email_address" placeholder="user@example.com" style={styles.input} />
                    <button type="submit" style={styles.btnPrimary}>
                        Add
                    </button>
                </form>
                <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                    Emails are normalized to lowercase.
                </div>
            </div>

            {error && <div style={styles.error}>Error: {error.message}</div>}

            <WhitelistEmailsTableClient rows={(rows ?? []) as any} />
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
        fontWeight: 800,
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