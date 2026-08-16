import { Banner } from "@astryxdesign/core/Banner";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";

export function Layout({
  children,
  flash,
  headerAction,
}: {
  children: ReactNode;
  flash?: string | null;
  headerAction?: ReactNode;
}) {
  const path = usePage().url.split("?", 1)[0];
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link href="/" isStandalone hasUnderline={false} className="brand-link">
          Edge Journal
        </Link>
        {isAdmin ? (
          <nav aria-label="Main navigation" className="site-nav">
            <Link href="/" isStandalone>Journal</Link>
            <Link href="/admin" isStandalone aria-current="page">Admin</Link>
          </nav>
        ) : headerAction ? <div className="header-action">{headerAction}</div> : null}
      </header>
      {flash ? (
        <div className="flash-region">
          <Banner status="success" title={flash} container="card" />
        </div>
      ) : null}
      <main className="page-content">{children}</main>
      <footer className="site-footer">
        <Text type="supporting" color="secondary">Edge Journal</Text>
        {isAdmin ? (
          <>
            <span aria-hidden="true">•</span>
            <Text type="supporting" color="secondary">Administration</Text>
          </>
        ) : null}
      </footer>
    </div>
  );
}
