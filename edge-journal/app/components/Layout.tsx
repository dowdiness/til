import { Banner } from "@astryxdesign/core/Banner";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { astryxOverrides } from "../styles/astryx-overrides.stylex";

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
    // Responsive contract:
    //   > 700px: horizontal header and wide publication regions.
    //   <= 700px: narrower frame gutters and compressed vertical rhythm.
    //   <= 500px: navigation/footer wrapping is allowed.
    <div className="journal-frame">
      <header className="mb-header-block flex items-baseline justify-between gap-8 max-narrow:mb-14">
        <Link href="/" isStandalone hasUnderline={false} xstyle={astryxOverrides.brandLink}>
          Edge Journal
        </Link>
        {isAdmin ? (
          <nav aria-label="Main navigation" className="flex items-center gap-5 max-mobile:gap-4">
            <Link href="/" isStandalone xstyle={astryxOverrides.navLink}>Journal</Link>
            <Link
              href="/admin"
              isStandalone
              xstyle={[astryxOverrides.navLink, astryxOverrides.currentNavLink]}
              aria-current="page"
            >
              Admin
            </Link>
          </nav>
        ) : headerAction ? <div className="-me-action-edge flex items-center">{headerAction}</div> : null}
      </header>
      {flash ? (
        <div data-flash-region className="-mt-9 mb-11 transition-focus duration-fast-max ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:translate-y-0 motion-reduce:transition-opacity motion-reduce:duration-fast-min">
          <Banner status="success" title={flash} container="card" />
        </div>
      ) : null}
      <main className="min-h-content-min">{children}</main>
      <footer className="mt-footer-block flex items-center justify-center gap-footer-gap pt-5 text-supporting text-secondary max-mobile:flex-wrap">
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
