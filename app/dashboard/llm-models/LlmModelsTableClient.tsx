"use client";

import { useMemo, useState } from "react";
import { updateLlmModel, deleteLlmModel } from "./actions";

type Provider = {
    id: number;
    name?: string | null;
    slug?: string | null;
};

type Row = {
    id: number;
    created_datetime_utc: string;
    name: string;
    llm_provider_id: number;
    provider_model_id: string;
    is_temperature_supported: boolean;
};

export default function LlmModelsTableClient({
                                                 rows,
                                                 providers,
                                             }: {
    rows: Row[];
    providers: Provider[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);

    const providerLabelById = useMemo(() => {
        const m = new Map<number, string>();
        (providers ?? []).forEach((p: any) => {
            const label = p.slug ?? p.name ?? `provider_${p.id}`;
            m.set(Number(p.id), String(label));
        });
        return m;
    }, [providers]);

    return (
        <div style={styles.card}>
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>id</th>
                        <th style={styles.th}>name</th>
                        <th style={styles.th}>llm_provider_id</th>
                        <th style={styles.th}>provider_model_id</th>
                        <th style={styles.th}>temp_supported</th>
                        <th style={styles.th}>created</th>
                        <th style={styles.th}>actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(rows ?? []).map((r) => {
                        const isEditing = editingId === r.id;

                        const mapped = providerLabelById.get(Number(r.llm_provider_id));
                        const showParenLabel = mapped && mapped !== String(r.llm_provider_id);

                        return (
                            <tr key={r.id}>
                                <td style={styles.tdMono}>{r.id}</td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="name"
                                            form={`llm-model-update-${r.id}`}
                                            defaultValue={r.name}
                                            style={styles.inputMed}
                                        />
                                    ) : (
                                        <div style={styles.cellWrap} title={r.name}>
                                            {r.name}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="llm_provider_id"
                                            form={`llm-model-update-${r.id}`}
                                            defaultValue={String(r.llm_provider_id)}
                                            style={styles.inputTiny}
                                            title="smallint; references llm_providers.id"
                                        />
                                    ) : (
                                        <div style={styles.mono}>
                                            {r.llm_provider_id}
                                            {showParenLabel ? <span style={{ opacity: 0.65 }}> ({mapped})</span> : null}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <input
                                            name="provider_model_id"
                                            form={`llm-model-update-${r.id}`}
                                            defaultValue={r.provider_model_id}
                                            style={styles.inputWide}
                                        />
                                    ) : (
                                        <div style={styles.cellWrapWide} title={r.provider_model_id}>
                                            {r.provider_model_id}
                                        </div>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {isEditing ? (
                                        <label style={styles.checkLabel}>
                                            <input
                                                type="checkbox"
                                                name="is_temperature_supported"
                                                form={`llm-model-update-${r.id}`}
                                                defaultChecked={!!r.is_temperature_supported}
                                            />
                                            <span>supported</span>
                                        </label>
                                    ) : (
                                        <span style={styles.mono}>{String(!!r.is_temperature_supported)}</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleString() : "—"}
                                </td>

                                <td style={styles.td}>
                                    <div style={styles.actions}>
                                        <form id={`llm-model-update-${r.id}`} action={updateLlmModel}>
                                            <input type="hidden" name="id" value={r.id} />
                                        </form>

                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="submit"
                                                    form={`llm-model-update-${r.id}`}
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

                                        <form action={deleteLlmModel}>
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
    mono: {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    cellWrap: {
        maxWidth: 260,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    cellWrapWide: {
        maxWidth: 420,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    actions: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },

    inputTiny: {
        width: 120,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },
    inputMed: {
        width: 240,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontWeight: 800,
        fontSize: 13,
    },
    inputWide: {
        width: 420,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12.5,
    },

    checkLabel: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.03)",
        fontWeight: 900,
        fontSize: 12.5,
        opacity: 0.9,
        width: "fit-content",
        whiteSpace: "nowrap",
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