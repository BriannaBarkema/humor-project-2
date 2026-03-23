"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/llm-providers");

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

function parseSmallint(raw: string, field: string) {
    const s = raw.trim();
    if (!s) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < -32768 || n > 32767) throw new Error(`${field} must fit in smallint`);
    return n;
}

export async function createLlmProvider(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const name = requiredText(formData.get("name"), "name");

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await admin.from("llm_providers").insert({ name, created_by_user_id: user.id });
    if (error) throw new Error(error.message);

    redirect("/dashboard/llm-providers");
}

export async function updateLlmProvider(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseSmallint(String(formData.get("id") ?? ""), "id");
    const name = requiredText(formData.get("name"), "name");

    const { error } = await admin.from("llm_providers").update({ name }).eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/llm-providers");
}

export async function deleteLlmProvider(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseSmallint(String(formData.get("id") ?? ""), "id");

    const { error } = await admin.from("llm_providers").delete().eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/llm-providers");
}