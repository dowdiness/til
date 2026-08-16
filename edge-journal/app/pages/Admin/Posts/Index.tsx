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
            onClick={() => restore.post(`/admin/posts/${undo.id}/restore`, {
              preserveScroll: true,
            })}
          />
        </div>
      ) : null}

      <AdminPostFilters />

      <section className="admin-section" aria-label="Posts">
        <Text type="supporting" color="secondary" as="h2">Entries</Text>
        <div className="admin-list">
          {posts.map((post) => (
            <article className="admin-entry" key={post.id}>
              <div className="entry-title-row">
                <Heading level={3}>{post.title}</Heading>
                <span className="entry-leader" aria-hidden="true" />
                <span className={`post-status post-status--${post.status}`}>
                  {post.status}
                </span>
              </div>
              <div className="admin-entry-detail">
                <Text type="code" color="secondary">/{post.slug}</Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Updated {updatedDate(post.updatedAt)}
                </Text>
              </div>
              <Text as="p" color="secondary" className="entry-excerpt">
                {post.excerpt}
              </Text>
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
          actions={<AdminClearFiltersButton />}
        />
      ) : null}
    </Layout>
  );
}
