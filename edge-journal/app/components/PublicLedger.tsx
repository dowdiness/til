import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@inertiajs/react";
import type { MouseEvent } from "react";
import type { PublicPostSummary } from "../../domain/post";
import { publishedDate } from "../../lib/published-date";
import { serializePublicSearch } from "../../lib/search-params";

const partialProps = ["posts", "query", "errors", "flash"];

type Posts = {
  items: PublicPostSummary[];
  total: number;
  page: number;
  pageCount: number;
};

type Props = {
  posts: Posts;
  query: string;
  isSearching: boolean;
  onClear: () => void;
  onOpenPost: (event: MouseEvent<Element>, href: string) => void;
};

export function PublicLedger({ posts, query, isSearching, onClear, onOpenPost }: Props) {
  return (
    <>
      <section className="page-intro">
        <Heading level={1} type="display-3" textWrap="balance">
          Published notes
        </Heading>
        <Text type="large" color="secondary" as="p">
          Short observations on software, systems, and making technical work easier to understand.
        </Text>
        <div className="result-summary">
          <Text type="supporting" color="secondary" as="p" hasTabularNumbers>
            {posts.total} {posts.total === 1 ? "note" : "notes"}
            {query ? <> matching <q>{query}</q></> : null}
          </Text>
          {query && posts.items.length > 0 ? (
            <Button
              type="button"
              label="Clear"
              variant="ghost"
              className="clear-search"
              isLoading={isSearching}
              isInterruptible
              onClick={onClear}
            />
          ) : null}
        </div>
      </section>

      <section aria-label="Published notes" className="journal-section">
        <div className="journal-list">
          {posts.items.map((post) => (
            <article className="journal-entry" key={post.id}>
              <div className="entry-title-row">
                <Heading level={2}>
                  <Link
                    className="story-link"
                    href={`/posts/${post.slug}`}
                    prefetch="hover"
                    cacheFor="30s"
                    onClick={(event) => onOpenPost(event, `/posts/${post.slug}`)}
                  >
                    {post.title}
                  </Link>
                </Heading>
                <span className="entry-leader" aria-hidden="true" />
                <time className="entry-date" dateTime={post.publishedAt}>
                  {publishedDate(post.publishedAt, "short")}
                </time>
              </div>
              <Text as="p" color="secondary" className="entry-excerpt">
                {post.excerpt}
              </Text>
            </article>
          ))}
        </div>
      </section>

      {posts.items.length === 0 ? (
        <EmptyState
          title={query ? "No notes match your search" : "No published notes yet"}
          description={query
            ? "Try another title or summary, or clear the search."
            : "Published notes will appear here."}
          headingLevel={2}
          actions={query
            ? <Button label="Clear search" variant="secondary" onClick={onClear} />
            : undefined}
        />
      ) : null}

      <nav aria-label="Pagination" className="pagination">
        {posts.page > 1 ? (
          <Link
            className="pagination-link"
            href={serializePublicSearch("/", {
              page: posts.page - 1,
              q: query || null,
            })}
            only={partialProps}
            preserveState
            preserveScroll
          >
            Previous
          </Link>
        ) : <span />}
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Page {posts.page} of {posts.pageCount}
        </Text>
        {posts.page < posts.pageCount ? (
          <Link
            className="pagination-link"
            href={serializePublicSearch("/", {
              page: posts.page + 1,
              q: query || null,
            })}
            only={partialProps}
            preserveState
            preserveScroll
          >
            Next
          </Link>
        ) : <span />}
      </nav>
    </>
  );
}
