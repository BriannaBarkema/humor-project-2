"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/llm-models");

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

function parseSmallint(raw: string, field: string, opts?: { allowNull?: boolean }) {
    const s = raw.trim();
    if (!s) {
        if (opts?.allowNull) return null;
        throw new Error(`${field} is required`);
    }
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < -32768 || n > 32767) throw new Error(`${field} must fit in smallint`);
    return n;
}

export async function createLlmModel(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const name = requiredText(formData.get("name"), "name");
    const llm_provider_id = parseSmallint(String(formData.get("llm_provider_id") ?? ""), "llm_provider_id");
    const provider_model_id = requiredText(formData.get("provider_model_id"), "provider_model_id");
    const is_temperature_supported = formData.get("is_temperature_supported") === "on";

    const { error } = await admin.from("llm_models").insert({
        name,
        llm_provider_id,
        provider_model_id,
        is_temperature_supported,
    });

    if (error) throw new Error(error.message);

    redirect("/dashboard/llm-models");
}

export async function updateLlmModel(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseSmallint(String(formData.get("id") ?? ""), "id");
    const name = requiredText(formData.get("name"), "name");
    const llm_provider_id = parseSmallint(String(formData.get("llm_provider_id") ?? ""), "llm_provider_id");
    const provider_model_id = requiredText(formData.get("provider_model_id"), "provider_model_id");
    const is_temperature_supported = formData.get("is_temperature_supported") === "on";

    const { error } = await admin
        .from("llm_models")
        .update({ name, llm_provider_id, provider_model_id, is_temperature_supported })
        .eq("id", id);

    if (error) throw new Error(error.message);

    redirect("/dashboard/llm-models");
}

export async function deleteLlmModel(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const id = parseSmallint(String(formData.get("id") ?? ""), "id");

    const { error } = await admin.from("llm_models").delete().eq("id", id);
    if (error) throw new Error(error.message);

    redirect("/dashboard/llm-models");
}