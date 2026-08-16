import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Head } from "@inertiajs/react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-body p-6">
      <Head title="Not found" />
      <EmptyState
        title="This page could not be found"
        description="The note may be unpublished, deleted, or available at another address."
        headingLevel={1}
        actions={<Button label="Return to the journal" href="/" variant="primary" />}
      />
    </main>
  );
}
