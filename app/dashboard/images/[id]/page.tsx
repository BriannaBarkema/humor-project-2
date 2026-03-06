import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { updateImage } from "../actions";

export default async function ImageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Hard guard so we never query with undefined
  if (!id || id === "undefined") {
    redirect("/dashboard/images");
  }

  const admin = createAdminClient();

  const { data: image, error } = await admin
    .from("images")
    .select(
      "id,url,created_datetime_utc,modified_datetime_utc,is_public,is_common_use,additional_context,profile_id,image_description,celebrity_recognition"
    )
    .eq("id", id)
    .single();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <header>
        <h1 style={styles.h1}>Edit image</h1>
        <p style={styles.subtle}>
          id: <span style={styles.mono}>{id}</span>
        </p>
      </header>

      {error && <div style={styles.error}>Error: {error.message}</div>}
      {!image && !error && <div style={styles.card}>Not found.</div>}

      {image && (
        <div style={styles.card}>
          <form action={updateImage} style={{ display: "grid", gap: 12 }}>
            <input type="hidden" name="id" value={id} />

            <label style={styles.label}>
              <div style={styles.labelTxt}>url</div>
              <input name="url" defaultValue={image.url ?? ""} style={styles.input} />
            </label>

            <label style={styles.label}>
              <div style={styles.labelTxt}>additional_context</div>
              <input
                name="additional_context"
                defaultValue={image.additional_context ?? ""}
                style={styles.input}
              />
            </label>

            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <label style={styles.checkLabel}>
                <input type="checkbox" name="is_public" defaultChecked={!!image.is_public} />
                <span>is_public</span>
              </label>

              <label style={styles.checkLabel}>
                <input type="checkbox" name="is_common_use" defaultChecked={!!image.is_common_use} />
                <span>is_common_use</span>
              </label>
            </div>

            <div style={{ opacity: 0.75, fontSize: 12 }}>
              Created:{" "}
              {image.created_datetime_utc ? new Date(image.created_datetime_utc).toLocaleString() : "—"}
              {" • "}
              Modified:{" "}
              {image.modified_datetime_utc ? new Date(image.modified_datetime_utc).toLocaleString() : "—"}
            </div>

            <button type="submit" style={styles.btnPrimary}>
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.3 },
  subtle: { margin: "6px 0 0 0", opacity: 0.75 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  card: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
  },
  error: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.08)",
  },
  label: { display: "grid", gap: 6 },
  labelTxt: { fontSize: 12.5, opacity: 0.75, fontWeight: 800 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
  },
  checkLabel: {
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