import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Head } from "@inertiajs/react";

export default function InternalServerError() {
  return (
    <main className="error-page">
      <Head title="Something went wrong" />
      <EmptyState
        title="Something went wrong"
        description="The request could not be completed. Please try again in a moment."
        headingLevel={1}
        actions={<Button label="Return to the journal" href="/" variant="primary" />}
      />
    </main>
  );
}
