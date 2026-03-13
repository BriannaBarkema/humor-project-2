"use client";

import { useState } from "react";
import { updateAllowedSignupDomain, deleteAllowedSignupDomain } from "./actions";

type Row = {
    id: number;
    created_datetime_utc: string;
    apex_domain: string;
};

export default function AllowedSignupDomainsTableClient({ rows }: { rows: Row[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div style={styles.card}>
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>id</th>
                        <th style={styles.th}>apex_domain</th>
                        <th style={styles.th}>created</th>
                        <th style={styles.th}>actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(rows ?? []).map((r) => {
                        const isEditing = editingId === r.id;

                        return (
                            <tr key={r.id}>
                                <td style={styles.tdMono}>{r.id}</td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="apex_domain"
                                            form={`asd-update-${r.id}`}
                                            defaultValue={r.apex_domain}
                                            style={styles.inputMed}
                                            placeholder="example.com"
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={r.apex_domain}>
                                            {r.apex_domain}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleString() : "—"}
                                </td>

                                <td style={styles.td}>
                                    <div style={styles.actions}>
                                        <form id={`asd-update-${r.id}`} action={updateAllowedSignupDomain}>
                                            <input type="hidden" name="id" value={r.id} />
                                        </form>

                                        {isEditing ? (
                                            <>
                                                <button type="submit" form={`asd-update-${r.id}`} style={styles.btnPrimarySmall}>
                                                    Save
                                                </button>
                                                <button type="button" onClick={() => setEditingId(null)} style={styles.btnSecondarySmall}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button type="button" onClick={() => setEditingId(r.id)} style={styles.btnSecondarySmall}>
                                                Edit
                                            </button>
                                        )}

                                        <form action={deleteAllowedSignupDomain}>
                                            <input type="hidden" name="id" value={r.id} />
                                            <button type="submit" style={styles.btnDanger}>
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
                Total shown: {rows?.length ?? 0}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
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
        maxWidth: 520,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    actions: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },

    inputMed: {
        width: 360,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontWeight: 800,
        fontSize: 13,
    },

    btnPrimarySmall: {
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "inherit",
        fontWeight: 900,
        cursor: "pointer",
        fontSize: 12.5,
    },
    btnSecondarySmall: {
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontWeight: 900,
        cursor: "pointer",
        fontSize: 12.5,
    },
    btnDanger: {
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,100,100,0.25)",
        background: "rgba(255,80,80,0.12)",
        color: "inherit",
        fontWeight: 900,
        cursor: "pointer",
        fontSize: 12.5,
    },
};