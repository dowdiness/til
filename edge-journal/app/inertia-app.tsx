import { Link as InertiaLink } from "@inertiajs/react";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import type { ReactElement, ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }): ReactElement {
  return (
    <Theme theme={neutralTheme} mode="light">
      <LinkProvider component={InertiaLink}>{children}</LinkProvider>
    </Theme>
  );
}

export function withApp(app: ReactElement): ReactElement {
  return <AppShell>{app}</AppShell>;
}
