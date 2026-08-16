import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
  AdminClearFiltersButton,
  AdminPostFilters,
} from "../../../components/AdminPostFilters";
import { Layout } from "../../../components/Layout";
import type { PageProps } from "../../../pages.gen";
import { astryxOverrides } from "../../../styles/astryx-overrides.stylex";
import { postStatusClassName } from "../../../styles/tailwind-classes";

type Props = PageProps<"Admin/Posts/Index">;

const updatedDateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

function updatedDate(value: string) {
  return updatedDateFormatter.format(new Date(value));
}

export default function Index({ posts, undo, flash }: Props) {
  const destroy = useForm({});
  const restore = useForm({});
  const [deletingId, setDeletingId] = useState<number | null>(null);

  return (
    <Layout flash={flash}>
      <Head title="Admin posts" />
      <div className="mb-12 flex items-end justify-between gap-8 max-narrow:items-start max-mobile:flex-col max-mobile:items-stretch">
        <div>
          <Heading level={1} type="display-3" xstyle={astryxOverrides.pageHeading}>Posts</Heading>
          <Text type="supporting" color="secondary" as="p" hasTabularNumbers xstyle={astryxOverrides.adminCount}>
            {posts.length} matching {posts.length === 1 ? "post" : "posts"}
          </Text>
        </div>
        <Button label="New post" href="/admin/posts/new" variant="secondary" className="max-mobile:w-fit" />
      </div>

      {undo ? (
        <div className="status-focus-pull -mt-5 mb-10 flex items-center justify-between gap-4 border-y border-dotted border-rule-strong py-3 transition-focus duration-status ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:translate-y-0 motion-reduce:transition-opacity motion-reduce:duration-fast-min contrast-more:border-solid contrast-more:border-secondary" role="status" aria-live="polite">
          <Text as="p" xstyle={astryxOverrides.resultCount}>“{undo.title}” was deleted.</Text>
          <Button
            label="Undo delete"
            variant="secondary"
            isLoading={restore.processing}
            onClick={() => restore.post(`/admin/posts/${undo.id}/restore`, {
              preserveScroll: true,
            })}
          />
        </div>
      ) : null}

      <AdminPostFilters />

      <section aria-label="Posts">
        <Text type="supporting" color="secondary" as="h2" xstyle={astryxOverrides.sectionHeading}>Entries</Text>
        <div className="flex flex-col">
          {posts.map((post) => (
            <article className="py-row max-mobile:py-3" key={post.id}>
              <div className="flex min-w-0 items-baseline gap-entry max-narrow:grid max-narrow:grid-cols-ledger max-narrow:gap-x-4 max-narrow:border-b max-narrow:border-dotted max-narrow:border-rule max-narrow:pb-row-rule contrast-more:border-solid contrast-more:border-secondary">
                <Heading level={3} xstyle={astryxOverrides.entryTitle}>{post.title}</Heading>
                <span className="min-w-6 flex-1 -translate-y-leader-shift border-b border-dotted border-rule max-narrow:hidden contrast-more:border-solid contrast-more:border-secondary" aria-hidden="true" />
                <span className={postStatusClassName[post.status]}>
                  {post.status}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-4 text-supporting tabular-nums max-mobile:flex-col max-mobile:items-start max-mobile:gap-micro">
                <Text type="code" color="secondary">/{post.slug}</Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Updated {updatedDate(post.updatedAt)}
                </Text>
              </div>
              <Text as="p" color="secondary" xstyle={astryxOverrides.entryExcerpt}>
                {post.excerpt}
              </Text>
              <div className="mt-row-rule flex flex-wrap items-center gap-3 max-mobile:flex-col max-mobile:items-start">
                <Button label="Edit" href={`/admin/posts/${post.id}/edit`} variant="ghost" xstyle={astryxOverrides.compactAction} />
                <Button
                  label="Delete"
                  variant="ghost"
                  className="delete-action"
                  xstyle={astryxOverrides.compactAction}
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
          actions={<AdminClearFiltersButton />}
        />
      ) : null}
    </Layout>
  );
}
