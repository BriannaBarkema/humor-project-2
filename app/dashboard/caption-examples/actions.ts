"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/caption-examples");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_superadmin) redirect("/login?next=/dashboard");
}

function requiredText(raw: FormDataEntryValue | null, field: string) {
    const s = String(raw ?? "").trim();
    if (!s) throw new Error(`${field} is required`);
    return s;
}

function parseSmallint(raw: string, field: string, opts?: { defaultValue?: number }) {
    const s = raw.trim();
    if (!s) {
        if (opts?.defaultValue !== undefined) return opts.defaultValue;
        throw new Error(`${field} is required`);
    }
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < -32768 || n > 32767) throw new Error(`${field} must fit in smallint`);
    return n;
}

function parseBigint(raw: string, field: string) {
    const s = raw.trim();
    if (!s) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < 1) throw new Error(`${field} must be >= 1`);
    return n;
}

function parseUuidOrNull(raw: string) {
    const s = raw.trim();
    if (!s) return null;
    // Minimal UUID sanity check (avoid passing junk to Postgres)
    const ok = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        s
    );
    if (!ok) throw new Error("image_id must be a valid UUID (or blank)");
    return s;
}

export async function createCaptionExample(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const image_description = requiredText(formData.get("image_description"), "image_description");
    const caption = requiredText(formData.get("caption"), "caption");
    const explanation = requiredText(formData.get("explanation"), "explanation");
    const priority = parseSmallint(String(formData.get("priority") ?? "0"), "priority", { defaultValue: 0 });
    const image_id = parseUuidOrNull(String(formData.get("image_id") ?? ""));

    const { error } = await admin.from("caption_examples").insert({
        image_description,
        caption,
        explanation,
        priority,
        image_id,
    });

    if (error) throw new Error(error.message);

    redirect("/dashboard/caption-examples");
}

export async function updateCaptionExample(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");
    const image_description = requiredText(formData.get("image_description"), "image_description");
    const caption = requiredText(formData.get("caption"), "caption");
    const explanation = requiredText(formData.get("explanation"), "explanation");
    const priority = parseSmallint(String(formData.get("priority") ?? "0"), "priority", { defaultValue: 0 });
    const image_id = parseUuidOrNull(String(formData.get("image_id") ?? ""));

    const { error } = await admin
        .from("caption_examples")
        .update({
            image_description,
            caption,
            explanation,
            priority,
            image_id,
            modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    redirect("/dashboard/caption-examples");
}

export async function deleteCaptionExample(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");

    const { error } = await admin.from("caption_examples").delete().eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/caption-examples");
}