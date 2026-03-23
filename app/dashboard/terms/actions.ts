"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/terms");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_superadmin) redirect("/login?next=/dashboard");
}

function parseSmallint(raw: string, field: string, opts?: { allowNull?: boolean; defaultValue?: number }) {
    const s = raw.trim();
    if (s.length === 0) {
        if (opts?.allowNull) return null;
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
    if (s.length === 0) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < 1) throw new Error(`${field} must be >= 1`);
    return n;
}

function requiredText(raw: FormDataEntryValue | null, field: string) {
    const s = String(raw ?? "").trim();
    if (!s) throw new Error(`${field} is required`);
    return s;
}

function optionalSmallint(raw: FormDataEntryValue | null) {
    const s = String(raw ?? "").trim();
    if (!s) return null;
    return parseSmallint(s, "term_type_id", { allowNull: true });
}

export async function createTerm(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const term = requiredText(formData.get("term"), "term");
    const definition = requiredText(formData.get("definition"), "definition");
    const example = requiredText(formData.get("example"), "example");
    const priority = parseSmallint(String(formData.get("priority") ?? "0"), "priority", { defaultValue: 0 });
    const term_type_id = optionalSmallint(formData.get("term_type_id"));

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/allowed-signup-domains");

    const { error } = await admin.from("terms").insert({
        term,
        definition,
        example,
        priority,
        term_type_id,
        created_by_user_id: user.id
    });

    if (error) throw new Error(error.message);

    redirect("/dashboard/terms");
}

export async function updateTerm(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");
    const term = requiredText(formData.get("term"), "term");
    const definition = requiredText(formData.get("definition"), "definition");
    const example = requiredText(formData.get("example"), "example");
    const priority = parseSmallint(String(formData.get("priority") ?? "0"), "priority", { defaultValue: 0 });
    const term_type_id = optionalSmallint(formData.get("term_type_id"));

    const { error } = await admin
        .from("terms")
        .update({
            term,
            definition,
            example,
            priority,
            term_type_id,
            modified_datetime_utc: new Date().toISOString(), // your column is timestamp w/o tz; ISO is fine
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    redirect("/dashboard/terms");
}

export async function deleteTerm(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");

    const { error } = await admin.from("terms").delete().eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/terms");
}