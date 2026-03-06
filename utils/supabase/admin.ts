import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server-only env var).");
  }

  // Service role bypasses RLS — ONLY use on server after superadmin check.
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}