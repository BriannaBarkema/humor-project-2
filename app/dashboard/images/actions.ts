"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/images");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) redirect("/login?next=/dashboard");
}

export async function createImage(formData: FormData) {
  await requireSuperadmin();
  const admin = createAdminClient();

  const url = String(formData.get("url") ?? "").trim();
  const additional_context = String(formData.get("additional_context") ?? "").trim();
  const is_public = formData.get("is_public") === "on";
  const is_common_use = formData.get("is_common_use") === "on";

  if (!url) throw new Error("url is required");

  const payload: any = { url, is_public, is_common_use };
  if (additional_context) payload.additional_context = additional_context;

  const { error } = await admin.from("images").insert(payload);
  if (error) throw new Error(error.message);

  redirect("/dashboard/images");
}

export async function deleteImage(formData: FormData) {
  await requireSuperadmin();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing id");

  const { error } = await admin.from("images").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/dashboard/images");
}

export async function updateImage(formData: FormData) {
  await requireSuperadmin();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const additional_context = String(formData.get("additional_context") ?? "").trim();
  const is_public = formData.get("is_public") === "on";
  const is_common_use = formData.get("is_common_use") === "on";

  if (!id) throw new Error("missing id");
  if (!url) throw new Error("url is required");

  const patch: any = { url, is_public, is_common_use };
  patch.additional_context = additional_context || null;

  const { error } = await admin.from("images").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  redirect(`/dashboard/images/${encodeURIComponent(id)}`);
}