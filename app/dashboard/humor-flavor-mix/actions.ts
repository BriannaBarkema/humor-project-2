"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard/humor-flavor-mix");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_superadmin) redirect("/login?next=/dashboard");
}

function parseSmallIntOrThrow(raw: string, field: string) {
    const s = raw.trim();
    if (s.length === 0) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < -32768 || n > 32767) throw new Error(`${field} must fit in smallint`);
    return n;
}

function parseBigIntOrThrow(raw: string, field: string) {
    const s = raw.trim();
    if (s.length === 0) throw new Error(`${field} is required`);
    const n = Number(s);
    if (!Number.isInteger(n)) throw new Error(`${field} must be an integer`);
    if (n < 1) throw new Error(`${field} must be >= 1`);
    return n;
}

export async function updateHumorFlavorMix(formData: FormData) {
    await requireSuperadmin();
    const admin = createAdminClient();

    const idRaw = String(formData.get("id") ?? "");
    const humorFlavorIdRaw = String(formData.get("humor_flavor_id") ?? "");
    const captionCountRaw = String(formData.get("caption_count") ?? "");

    const id = parseBigIntOrThrow(idRaw, "id");
    const humor_flavor_id = parseBigIntOrThrow(humorFlavorIdRaw, "humor_flavor_id");
    const caption_count = parseSmallIntOrThrow(captionCountRaw, "caption_count");

    const { error } = await admin
        .from("humor_flavor_mix")
        .update({ humor_flavor_id, caption_count })
        .eq("id", id);

    if (error) throw new Error(error.message);

    redirect("/dashboard/humor-flavor-mix");
}