"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/whitelist-email-addresses");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_superadmin) redirect("/login?next=/dashboard");
}

function parseBigint(raw: string, field: string) {
    const s = raw.trim();
    if (!s) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < 1) throw new Error(`${field} must be >= 1`);
    return n;
}

function normalizeEmail(raw: string) {
    const s = raw.trim().toLowerCase();

    // Minimal sanity check (not RFC-perfect, but prevents obvious junk)
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    if (!ok) throw new Error("email_address must look like an email, e.g. user@example.com");

    return s;
}

export async function createWhitelistEmail(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const email_address = normalizeEmail(String(formData.get("email_address") ?? ""));

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/allowed-signup-domains");

    const { error } = await admin.from("whitelist_email_addresses").insert({
        email_address,
        created_by_user_id: user.id
    });

    if (error) throw new Error(error.message);

    redirect("/dashboard/whitelist-email-addresses");
}

export async function updateWhitelistEmail(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");
    const email_address = normalizeEmail(String(formData.get("email_address") ?? ""));

    const { error } = await admin
        .from("whitelist_email_addresses")
        .update({
            email_address,
            modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    redirect("/dashboard/whitelist-email-addresses");
}

export async function deleteWhitelistEmail(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");

    const { error } = await admin.from("whitelist_email_addresses").delete().eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/whitelist-email-addresses");
}