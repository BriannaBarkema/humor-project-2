"use client";

import { useState } from "react";
import { updateCaptionExample, deleteCaptionExample } from "./actions";

type Row = {
    id: number;
    created_datetime_utc: string;
    modified_datetime_utc: string | null;
    image_description: string;
    caption: string;
    explanation: string;
    priority: number;
    image_id: string | null;
};

export default function CaptionExamplesTableClient({ rows }: { rows: Row[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div style={styles.card}>
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>id</th>
                        <th style={styles.th}>priority</th>
                        <th style={styles.th}>image_id</th>
                        <th style={styles.th}>image_description</th>
                        <th style={styles.th}>caption</th>
                        <th style={styles.th}>explanation</th>
                        <th style={styles.th}>created</th>
                        <th style={styles.th}>modified</th>
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
                                            name="priority"
                                            form={`ce-update-${r.id}`}
                                            defaultValue={String(r.priority)}
                                            style={styles.inputTiny}
                                        />
                                    ) : (
                                        <span style={styles.mono}>{r.priority}</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="image_id"
                                            form={`ce-update-${r.id}`}
                                            defaultValue={r.image_id ?? ""}
                                            placeholder="(optional uuid)"
                                            style={styles.inputUuid}
                                        />
                                    ) : (
                                        <span style={styles.tdMono}>{r.image_id ?? "—"}</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <textarea
                                            name="image_description"
                                            form={`ce-update-${r.id}`}
                                            defaultValue={r.image_description}
                                            style={styles.textareaRow}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={r.image_description}>
                                            {r.image_description}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <textarea
                                            name="caption"
                                            form={`ce-update-${r.id}`}
                                            defaultValue={r.caption}
                                            style={styles.textareaRow}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={r.caption}>
                                            {r.caption}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <textarea
                                            name="explanation"
                                            form={`ce-update-${r.id}`}
                                            defaultValue={r.explanation}
                                            style={styles.textareaRow}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={r.explanation}>
                                            {r.explanation}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleString() : "—"}
                                </td>

                                <td style={styles.td}>
                                    {r.modified_datetime_utc ? new Date(r.modified_datetime_utc).toLocaleString() : "—"}
                                </td>

                                <td style={styles.td}>
                                    <div style={styles.actions}>
                                        <form id={`ce-update-${r.id}`} action={updateCaptionExample}>
                                            <input type="hidden" name="id" value={r.id} />
                                        </form>

                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="submit"
                                                    form={`ce-update-${r.id}`}
                                                    style={styles.btnPrimarySmall}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    style={styles.btnSecondarySmall}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(r.id)}
                                                style={styles.btnSecondarySmall}
                                            >
                                                Edit
                                            </button>
                                        )}

                                        <form action={deleteCaptionExample}>
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
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
        whiteSpace: "nowrap",
    },
    mono: {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    cellWrap: {
        maxWidth: 340,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    actions: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    inputTiny: {
        width: 90,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },
    inputUuid: {
        width: 320,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },
    textareaRow: {
        width: 320,
        minHeight: 68,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        resize: "vertical",
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