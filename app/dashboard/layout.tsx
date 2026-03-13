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
            <Section title="Core">
              <NavItem href="/dashboard" label="Overview" />
              <NavItem href="/dashboard/users" label="Users / Profiles" />
              <NavItem href="/dashboard/images" label="Images" />
              <NavItem href="/dashboard/captions" label="Captions" />
            </Section>

            <Section title="Humor config">
              <NavItem href="/dashboard/humor-flavors" label="Humor flavors" />
              <NavItem href="/dashboard/humor-flavor-steps" label="Humor flavor steps" />
              <NavItem href="/dashboard/humor-flavor-mix" label="Humor flavor mix" />
            </Section>

            <Section title="LLM config">
              <NavItem href="/dashboard/llm-providers" label="LLM providers" />
              <NavItem href="/dashboard/llm-models" label="LLM models" />
              <NavItem href="/dashboard/llm-prompt-chains" label="LLM prompt chains" />
              <NavItem href="/dashboard/llm-responses" label="LLM responses" />
            </Section>

            <Section title="Content">
              <NavItem href="/dashboard/terms" label="Terms" />
              <NavItem href="/dashboard/caption-examples" label="Caption examples" />
            </Section>

            <Section title="Requests">
              <NavItem href="/dashboard/caption-requests" label="Caption requests" />
            </Section>

            <Section title="Access control">
              <NavItem href="/dashboard/allowed-signup-domains" label="Allowed signup domains" />
              <NavItem href="/dashboard/whitelist-email-addresses" label="Whitelisted emails" />
            </Section>
          </nav>

          <div style={styles.footer}>
            <form action="/auth/signout" method="post">
              <button style={styles.signOut} type="submit">
                Sign out
              </button>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>{title}</div>
        <div style={{ display: "grid", gap: 8 }}>{children}</div>
      </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    minHeight: "100vh",
  },
  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.12)",
    padding: 16,
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "rgba(255,255,255,0.02)",
    overflowY: "auto",
  },
  brand: {
    fontWeight: 900,
    fontSize: 18,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  nav: { display: "grid", gap: 14 },
  section: {
    display: "grid",
    gap: 8,
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.75,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  navItem: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    textDecoration: "none",
    color: "inherit",
    background: "rgba(255,255,255,0.03)",
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
  },
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
  main: { padding: 20, maxWidth: 1200, width: "100%", margin: "0 auto" },
};