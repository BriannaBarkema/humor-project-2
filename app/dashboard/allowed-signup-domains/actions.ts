"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/allowed-signup-domains");

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

function parseBigint(raw: string, field: string) {
    const s = raw.trim();
    if (!s) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < 1) throw new Error(`${field} must be >= 1`);
    return n;
}

function normalizeApexDomain(raw: string) {
    // Accept "example.com" or "EXAMPLE.COM" and store normalized "example.com"
    let s = raw.trim().toLowerCase();

    // Strip protocol, path, trailing slash if user pastes a full URL
    s = s.replace(/^https?:\/\//, "");
    s = s.split("/")[0];

    // Strip leading wildcard/dot
    s = s.replace(/^\*\./, "");
    s = s.replace(/^\./, "");

    // Basic sanity check: must contain at least one dot, no spaces
    if (!s.includes(".") || /\s/.test(s)) {
        throw new Error("apex_domain must look like a domain, e.g. example.com");
    }

    return s;
}

export async function createAllowedSignupDomain(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const apex_domain = normalizeApexDomain(requiredText(formData.get("apex_domain"), "apex_domain"));

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await admin.from("allowed_signup_domains").insert({ apex_domain, created_by_user_id: user.id });
    if (error) throw new Error(error.message);

    redirect("/dashboard/allowed-signup-domains");
}

export async function updateAllowedSignupDomain(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");
    const apex_domain = normalizeApexDomain(requiredText(formData.get("apex_domain"), "apex_domain"));

    const { error } = await admin.from("allowed_signup_domains").update({ apex_domain }).eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/allowed-signup-domains");
}

export async function deleteAllowedSignupDomain(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseBigint(String(formData.get("id") ?? ""), "id");

    const { error } = await admin.from("allowed_signup_domains").delete().eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/allowed-signup-domains");
}