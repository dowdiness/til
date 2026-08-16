import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Head, router, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Layout } from "../../../components/Layout";
import type { PageProps } from "../../../pages.gen";
import { isPostStatus } from "../../../../domain/post-validation";

type Props = PageProps<"Admin/Posts/Index">;

const partialProps = ["posts", "query", "status", "undo", "errors", "flash"];
const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

function updatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export default function Index({ posts, query, status, undo, flash }: Props) {
  const destroy = useForm({});
  const restore = useForm({});
  const [filterQuery, setFilterQuery] = useState(query);
  const [filterStatus, setFilterStatus] = useState(status);
  const [isFiltering, setIsFiltering] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const visitCounter = useRef(0);
  useEffect(() => {
    setFilterQuery(query);
    setFilterStatus(status);
  }, [query, status]);

  const visit = (data: { q?: string; status?: "draft" | "published" }) => {
    const visitId = ++visitCounter.current;
    setIsFiltering(true);
    router.get(
      "/admin/posts",
      data,
      {
        only: partialProps,
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onFinish: () => {
          if (visitCounter.current === visitId) setIsFiltering(false);
        },
      },
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = filterQuery.trim();
    visit({
      ...(nextQuery ? { q: nextQuery } : {}),
      ...(isPostStatus(filterStatus) ? { status: filterStatus } : {}),
    });
  };
  const clearFilters = () => {
    setFilterQuery("");
    setFilterStatus("all");
    visit({});
  };

  return (
    <Layout flash={flash}>
      <Head title="Admin posts" />
      <div className="admin-heading">
        <div>
          <Heading level={1} type="display-3">Posts</Heading>
          <Text type="supporting" color="secondary" as="p" hasTabularNumbers>
            {posts.length} matching {posts.length === 1 ? "post" : "posts"}
          </Text>
        </div>
        <Button label="New post" href="/admin/posts/new" variant="secondary" />
      </div>

      {undo ? (
        <div className="undo-notice" role="status" aria-live="polite">
          <Text as="p">“{undo.title}” was deleted.</Text>
          <Button
            label="Undo delete"
            variant="secondary"
            isLoading={restore.processing}
            onClick={() => restore.post(`/admin/posts/${undo.id}/restore`, { preserveScroll: true })}
          />
        </div>
      ) : null}

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
            if (value === "all" || value === "draft" || value === "published") setFilterStatus(value);
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
          {(query || status !== "all") ? (
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

      <section className="admin-section" aria-label="Posts">
        <Text type="supporting" color="secondary" as="h2">Entries</Text>
        <div className="admin-list">
          {posts.map((post) => (
            <article className="admin-entry" key={post.id}>
              <div className="entry-title-row">
                <Heading level={3}>{post.title}</Heading>
                <span className="entry-leader" aria-hidden="true" />
                <span className={`post-status post-status--${post.status}`}>{post.status}</span>
              </div>
              <div className="admin-entry-detail">
                <Text type="code" color="secondary">/{post.slug}</Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Updated {updatedDate(post.updatedAt)}
                </Text>
              </div>
              <Text as="p" color="secondary" className="entry-excerpt">{post.excerpt}</Text>
              <div className="card-actions">
                <Button label="Edit" href={`/admin/posts/${post.id}/edit`} variant="ghost" />
                <Button
                  label="Delete"
                  variant="ghost"
                  className="delete-action"
                  isDisabled={destroy.processing}
                  isLoading={destroy.processing && deletingId === post.id}
                  onClick={() => {
                    setDeletingId(post.id);
                    destroy.delete(`/admin/posts/${post.id}`, {
                      preserveScroll: true,
                      onFinish: () => setDeletingId(null),
                    });
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts match these filters"
          description="Try another phrase or include both publication states."
          headingLevel={2}
          actions={<Button label="Clear filters" variant="secondary" onClick={clearFilters} />}
        />
      ) : null}
    </Layout>
  );
}
