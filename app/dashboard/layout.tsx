import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) redirect("/login?next=/dashboard");

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>Admin</div>

        <nav style={styles.nav}>
          <NavItem href="/dashboard" label="Overview" />
          <NavItem href="/dashboard/users" label="Users / Profiles" />
          <NavItem href="/dashboard/images" label="Images" />
          <NavItem href="/dashboard/captions" label="Captions" />
        </nav>

        <div style={styles.footer}>
          <form action="/auth/signout" method="post">
            <button style={styles.signOut} type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={styles.navItem}>
      {label}
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" },
  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.12)",
    padding: 16,
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "rgba(255,255,255,0.02)",
  },
  brand: { fontWeight: 900, fontSize: 18, letterSpacing: -0.2, marginBottom: 14 },
  nav: { display: "grid", gap: 8 },
  navItem: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.03)",
  },
  footer: { marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.10)" },
  signOut: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 700,
  },
  main: { padding: 20, maxWidth: 1100, width: "100%", margin: "0 auto" },
};