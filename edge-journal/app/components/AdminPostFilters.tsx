import { Button } from "@astryxdesign/core/Button";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { debounce, defaultRateLimit, useQueryStates } from "nuqs";
import { useTransition, type FormEvent } from "react";
import { adminSearchParams } from "../../lib/search-params";
import { NuqsInertiaAdapter } from "../nuqs-inertia-adapter";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const partialProps = ["posts", "query", "status", "undo", "errors", "flash"];
const searchDebounce = debounce(300);

function AdminPostFilterFields() {
  const [isFiltering, startTransition] = useTransition();
  const [{ q: filterQuery, status: filterStatus }, setFilters] = useQueryStates(
    adminSearchParams,
    {
      history: "replace",
      shallow: false,
      startTransition,
    },
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await setFilters(
      { q: filterQuery || null, status: filterStatus },
      { limitUrlUpdates: defaultRateLimit },
    );
  };

  const clearFilters = async () => {
    await setFilters(
      { q: null, status: null },
      { limitUrlUpdates: defaultRateLimit },
    );
  };

  return (
    <form className="admin-filters" role="search" aria-busy={isFiltering} onSubmit={submit}>
      <TextInput
        label="Search posts"
        value={filterQuery}
        changeAction={async (nextQuery) => {
          await setFilters(
            { q: nextQuery || null },
            {
              limitUrlUpdates: nextQuery.length > 0 ? searchDebounce : defaultRateLimit,
            },
          );
        }}
        placeholder="Title, slug, or excerpt"
        hasClear
        isLoading={isFiltering}
        width="100%"
      />
      <Selector
        label="Status"
        options={statusOptions}
        value={filterStatus}
        changeAction={async (value) => {
          if (value !== "all" && value !== "draft" && value !== "published") {
            return;
          }
          await setFilters(
            {
              q: filterQuery || null,
              status: value === "all" ? null : value,
            },
            { limitUrlUpdates: defaultRateLimit },
          );
        }}
        isLoading={isFiltering}
        width="100%"
      />
      <div className="filter-actions">
        {filterQuery || filterStatus !== "all" ? (
          <Button
            type="button"
            label="Clear"
            variant="ghost"
            isLoading={isFiltering}
            isInterruptible
            onClick={clearFilters}
          />
        ) : null}
      </div>
    </form>
  );
}

export function AdminPostFilters() {
  return (
    <NuqsInertiaAdapter only={partialProps}>
      <AdminPostFilterFields />
    </NuqsInertiaAdapter>
  );
}

function ClearFiltersButton() {
  const [isFiltering, startTransition] = useTransition();
  const [, setFilters] = useQueryStates(adminSearchParams, {
    history: "replace",
    shallow: false,
    startTransition,
  });

  return (
    <Button
      label="Clear filters"
      variant="secondary"
      isLoading={isFiltering}
      onClick={async () => {
        await setFilters(
          { q: null, status: null },
          { limitUrlUpdates: defaultRateLimit },
        );
      }}
    />
  );
}

export function AdminClearFiltersButton() {
  return (
    <NuqsInertiaAdapter only={partialProps}>
      <ClearFiltersButton />
    </NuqsInertiaAdapter>
  );
}
