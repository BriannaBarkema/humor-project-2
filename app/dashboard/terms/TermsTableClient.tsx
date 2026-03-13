"use client";

import { useMemo, useState } from "react";
import { updateTerm, deleteTerm } from "./actions";

type TermRow = {
    id: number;
    created_datetime_utc: string;
    modified_datetime_utc: string | null;
    term: string;
    definition: string;
    example: string;
    priority: number;
    term_type_id: number | null;
};

type TermType = {
    id: number;
    slug: string | null;
    description: string | null;
};

export default function TermsTableClient({
                                             terms,
                                             termTypes,
                                         }: {
    terms: TermRow[];
    termTypes: TermType[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);

    const typeLabelById = useMemo(() => {
        const m = new Map<number, string>();
        (termTypes ?? []).forEach((t) => {
            const label = t.slug ?? t.description ?? `type_${t.id}`;
            m.set(Number(t.id), String(label));
        });
        return m;
    }, [termTypes]);

    return (
        <div style={styles.card}>
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>id</th>
                        <th style={styles.th}>priority</th>
                        <th style={styles.th}>term</th>
                        <th style={styles.th}>term_type_id</th>
                        <th style={styles.th}>definition</th>
                        <th style={styles.th}>example</th>
                        <th style={styles.th}>created</th>
                        <th style={styles.th}>modified</th>
                        <th style={styles.th}>actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(terms ?? []).map((t) => {
                        const isEditing = editingId === t.id;

                        const typeId = t.term_type_id;
                        const mapped = typeId != null ? typeLabelById.get(Number(typeId)) : undefined;
                        const showParenLabel =
                            typeId != null && mapped && mapped !== String(typeId);

                        return (
                            <tr key={t.id}>
                                <td style={styles.tdMono}>{t.id}</td>

                                {/* priority */}
                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="priority"
                                            form={`term-update-${t.id}`}
                                            defaultValue={String(t.priority)}
                                            style={styles.inputTiny}
                                        />
                                    ) : (
                                        <span style={styles.mono}>{t.priority}</span>
                                    )}
                                </td>

                                {/* term */}
                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="term"
                                            form={`term-update-${t.id}`}
                                            defaultValue={t.term}
                                            style={styles.inputMed}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={t.term}>
                                            {t.term}
                                        </div>
                                    )}
                                </td>

                                {/* term_type_id */}
                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="term_type_id"
                                            form={`term-update-${t.id}`}
                                            defaultValue={typeId ?? ""}
                                            placeholder="(null)"
                                            style={styles.inputTiny}
                                            title="smallint; references term_types.id"
                                        />
                                    ) : (
                                        <div style={styles.mono}>
                                            {typeId ?? "—"}
                                            {showParenLabel ? (
                                                <span style={{ opacity: 0.65 }}> ({mapped})</span>
                                            ) : null}
                                        </div>
                                    )}
                                </td>

                                {/* definition */}
                                <td style={styles.td}>
                                    {isEditing ? (
                                        <textarea
                                            name="definition"
                                            form={`term-update-${t.id}`}
                                            defaultValue={t.definition}
                                            style={styles.textareaRow}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={t.definition}>
                                            {t.definition}
                                        </div>
                                    )}
                                </td>

                                {/* example */}
                                <td style={styles.td}>
                                    {isEditing ? (
                                        <textarea
                                            name="example"
                                            form={`term-update-${t.id}`}
                                            defaultValue={t.example}
                                            style={styles.textareaRow}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={t.example}>
                                            {t.example}
                                        </div>
                                    )}
                                </td>

                                {/* created */}
                                <td style={styles.td}>
                                    {t.created_datetime_utc
                                        ? new Date(t.created_datetime_utc).toLocaleString()
                                        : "—"}
                                </td>

                                {/* modified */}
                                <td style={styles.td}>
                                    {t.modified_datetime_utc
                                        ? new Date(t.modified_datetime_utc).toLocaleString()
                                        : "—"}
                                </td>

                                {/* actions */}
                                <td style={styles.td}>
                                    <div style={styles.actions}>
                                        {/* Hidden form for Save */}
                                        <form id={`term-update-${t.id}`} action={updateTerm}>
                                            <input type="hidden" name="id" value={t.id} />
                                        </form>

                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="submit"
                                                    form={`term-update-${t.id}`}
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
                                                onClick={() => setEditingId(t.id)}
                                                style={styles.btnSecondarySmall}
                                            >
                                                Edit
                                            </button>
                                        )}

                                        <form action={deleteTerm}>
                                            <input type="hidden" name="id" value={t.id} />
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
                Total shown: {terms?.length ?? 0}
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

    inputMed: {
        width: 220,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontWeight: 800,
        fontSize: 13,
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