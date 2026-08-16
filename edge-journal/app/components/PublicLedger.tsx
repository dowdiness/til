import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { Pagination } from "@astryxdesign/core/Pagination";
import { Text } from "@astryxdesign/core/Text";
import { Link, router } from "@inertiajs/react";
import { useRef, useState, type MouseEvent } from "react";
import type { PublicPostSummary } from "../../domain/post";
import { publishedDate } from "../../lib/published-date";
import { serializePublicSearch } from "../../lib/search-params";
import { astryxOverrides } from "../styles/astryx-overrides.stylex";

const partialProps = ["posts", "query", "errors", "flash"];
const entryDelayClasses = [
  "",
  "[animation-delay:30ms]",
  "[animation-delay:60ms]",
  "[animation-delay:90ms]",
  "[animation-delay:120ms]",
  "[animation-delay:150ms]",
] as const;

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

type PublicPaginationProps = {
  page: number;
  pageCount: number;
  query: string;
};

function PublicPagination({ page, pageCount, query }: PublicPaginationProps) {
  const [currentPage, setCurrentPage] = useState(page);
  const visitCounter = useRef(0);

  if (pageCount <= 1) return null;

  const changePage = (nextPage: number) => new Promise<void>((resolve) => {
    const visitId = ++visitCounter.current;
    router.visit(serializePublicSearch("/", {
      page: nextPage,
      q: query || null,
    }), {
      only: partialProps,
      preserveState: true,
      preserveScroll: true,
      onCancel: () => {
        if (visitCounter.current === visitId) setCurrentPage(page);
      },
      onError: () => {
        if (visitCounter.current === visitId) setCurrentPage(page);
      },
      onFinish: () => resolve(),
    });
  });

  return (
    <div className="mt-14 flex justify-center border-t border-dotted border-rule pt-4 contrast-more:border-solid contrast-more:border-secondary">
      <Pagination
        page={currentPage}
        onChange={setCurrentPage}
        changeAction={changePage}
        totalPages={pageCount}
        variant="compact"
        size="sm"
        label="Journal pagination"
        xstyle={astryxOverrides.pagination}
      />
    </div>
  );
}

export function PublicLedger({ posts, query, isSearching, onClear, onOpenPost }: Props) {
  return (
    <>
      <section className="mb-12 max-w-page max-narrow:mb-11">
        <Heading level={1} type="display-3" textWrap="balance" xstyle={astryxOverrides.pageHeading}>
          Published notes
        </Heading>
        <Text type="large" color="secondary" as="p" xstyle={astryxOverrides.pageLead}>
          Short observations on software, systems, and making technical work easier to understand.
        </Text>
        <div className="mt-4 flex flex-wrap items-center gap-x-result-x gap-y-result-y">
          <Text
            type="supporting"
            color="secondary"
            as="p"
            hasTabularNumbers
            role="status"
            aria-live="polite"
            aria-atomic="true"
            xstyle={astryxOverrides.resultCount}
          >
            {posts.total} {posts.total === 1 ? "note" : "notes"}
            {query ? <> matching <q>{query}</q></> : null}
          </Text>
          {query && posts.items.length > 0 ? (
            <Button
              type="button"
              label="Clear"
              variant="ghost"
              isLoading={isSearching}
              isInterruptible
              xstyle={astryxOverrides.compactAction}
              onClick={onClear}
            />
          ) : null}
        </div>
      </section>

      <section aria-label="Published notes">
        <div className="flex flex-col">
          {posts.items.map((post, index) => (
            <article
              className={`relative animate-ledger-entry py-2.5 motion-reduce:animate-ledger-fade motion-reduce:[animation-delay:0ms] max-mobile:py-3 ${entryDelayClasses[Math.min(index, 5)]}`}
              key={post.id}
            >
              <div className="flex min-w-0 items-baseline gap-entry max-narrow:grid max-narrow:grid-cols-ledger max-narrow:gap-x-4 max-narrow:border-b max-narrow:border-dotted max-narrow:border-rule max-narrow:pb-row-rule contrast-more:border-solid contrast-more:border-secondary">
                <Heading level={2}>
                  <Link
                    className="relative text-inherit no-underline after:absolute after:inset-0 after:content-[''] hover:text-interactive hover:underline focus-visible:text-interactive focus-visible:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-[#171717] active:opacity-55 active:transition-opacity active:duration-75 coarse:underline coarse:decoration-touch-decoration coarse:decoration-1 coarse:underline-offset-[0.18em] contrast-more:decoration-current contrast-more:focus-visible:outline-2"
                    href={`/posts/${post.slug}`}
                    prefetch="hover"
                    cacheFor="30s"
                    onClick={(event) => onOpenPost(event, `/posts/${post.slug}`)}
                  >
                    {post.title}
                  </Link>
                </Heading>
                <span className="min-w-6 flex-1 -translate-y-leader-shift border-b border-dotted border-rule max-narrow:hidden contrast-more:border-solid contrast-more:border-secondary" aria-hidden="true" />
                <time className="flex-none whitespace-nowrap text-label text-secondary tabular-nums" dateTime={post.publishedAt}>
                  {publishedDate(post.publishedAt, "short")}
                </time>
              </div>
              <Text as="p" color="secondary" xstyle={astryxOverrides.entryExcerpt}>
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

      <PublicPagination
        key={`${query}:${posts.page}`}
        page={posts.page}
        pageCount={posts.pageCount}
        query={query}
      />
    </>
  );
}
