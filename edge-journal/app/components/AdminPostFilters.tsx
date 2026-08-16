import { Button } from "@astryxdesign/core/Button";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useState, type FormEvent } from "react";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

type Status = "all" | "draft" | "published";

type AppliedFilters = {
  q?: string;
  status?: Exclude<Status, "all">;
};

type Props = {
  query: string;
  status: string;
  isFiltering: boolean;
  onApply: (filters: AppliedFilters) => void;
};

export function AdminPostFilters({ query, status, isFiltering, onApply }: Props) {
  const initialStatus: Status = status === "draft" || status === "published" ? status : "all";
  const [filterQuery, setFilterQuery] = useState(query);
  const [filterStatus, setFilterStatus] = useState<Status>(initialStatus);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = filterQuery.trim();
    onApply({
      ...(nextQuery ? { q: nextQuery } : {}),
      ...(filterStatus !== "all" ? { status: filterStatus } : {}),
    });
  };

  const clearFilters = () => {
    setFilterQuery("");
    setFilterStatus("all");
    onApply({});
  };

  return (
    <form className="admin-filters" role="search" onSubmit={submit}>
      <TextInput
        label="Search posts"
        value={filterQuery}
        onChange={setFilterQuery}
        placeholder="Title, slug, or excerpt"
        hasClear
        width="100%"
      />
      <Selector
        label="Status"
        options={statusOptions}
        value={filterStatus}
        onChange={(value) => {
          if (value === "all" || value === "draft" || value === "published") {
            setFilterStatus(value);
          }
        }}
        width="100%"
      />
      <div className="filter-actions">
        <Button
          type="submit"
          label="Apply"
          variant="ghost"
          isLoading={isFiltering}
          isInterruptible
        />
        {query || status !== "all" ? (
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
