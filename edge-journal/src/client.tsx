import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { withApp } from "../app/inertia-app";
import "./tailwind.css";

if (import.meta.env.DEV) {
  await import("./astryx-dev.css");
  await import("../app/styles/astryx-overrides.stylex");
  await import("virtual:stylex:runtime");
}

type NavigatorCapabilities = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const capabilities = navigator as NavigatorCapabilities;
const hasLimitedMemory = capabilities.deviceMemory !== undefined && capabilities.deviceMemory <= 4;
const hasLimitedConcurrency = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
const prefersReducedData = capabilities.connection?.saveData === true;

document.documentElement.dataset.visualEffects =
  hasLimitedMemory || hasLimitedConcurrency || prefersReducedData ? "low" : "full";

const pages = import.meta.glob<{ default: ResolvedComponent }>("../app/pages/**/*.tsx");

async function resolvePage(name: string): Promise<ResolvedComponent> {
  const page = await pages[`../app/pages/${name}.tsx`]?.();
  if (!page) throw new Error(`Unknown page: ${name}`);
  return page.default;
}

createInertiaApp({
  serverHead: true,
  resolve: resolvePage,
  withApp,
});
