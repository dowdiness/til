import { Button } from "@astryxdesign/core/Button";
import { Dialog } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Layout } from "../../components/Layout";
import type { PageProps } from "../../pages.gen";
import type { PublicPostSummary } from "../../../domain/post";
import { JOURNAL_DESCRIPTION } from "../../../lib/page-head";
import { publishedDate } from "../../../lib/published-date";

type Props = PageProps<"Posts/Index">;

const partialProps = ["posts", "query", "errors", "flash"];

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="search-icon" focusable="false" viewBox="0 0 24 24">
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path d="m15.4 15.4 4.1 4.1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="close-icon" focusable="false" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function Index({ posts, query, flash }: Props) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosePreparing, setIsSearchClosePreparing] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchDialogRef = useRef<HTMLDialogElement | null>(null);
  const visitCounter = useRef(0);
  useEffect(() => setSearchQuery(query), [query]);
  useEffect(() => {
    if (!isSearchClosePreparing) return;
    const frame = requestAnimationFrame(() => {
      setIsSearchClosePreparing(false);
      setIsSearchClosing(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isSearchClosePreparing]);

  const openSearch = () => {
    setIsSearchClosePreparing(false);
    setIsSearchClosing(false);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    if (
      !isSearchOpen ||
      isSearchClosePreparing ||
      isSearchClosing ||
      !searchDialogRef.current?.open
    ) return;
    setIsSearchClosePreparing(true);
  };

  const finishSearchClose = () => {
    if (!isSearchClosing) return;
    setIsSearchClosePreparing(false);
    setIsSearchClosing(false);
    setIsSearchOpen(false);
  };

  const visit = (data: { q?: string }) => {
    const visitId = ++visitCounter.current;
    setIsSearching(true);
    router.get(
      "/",
      data,
      {
        only: partialProps,
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onSuccess: closeSearch,
        onFinish: () => {
          if (visitCounter.current === visitId) setIsSearching(false);
        },
      },
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchQuery.trim();
    visit(nextQuery ? { q: nextQuery } : {});
  };

  const clearSearch = () => {
    setSearchQuery("");
    visit({});
  };

  const openPost = (event: MouseEvent<Element>, href: string) => {
    if (!(event.currentTarget instanceof HTMLElement)) return;

    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const shouldTransition =
      event.detail > 0 &&
      event.button === 0 &&
      !isModifiedClick &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "startViewTransition" in document;

    if (!shouldTransition) return;

    event.preventDefault();
    const source = event.currentTarget;
    const cleanup = () => source.style.removeProperty("view-transition-name");
    source.style.setProperty("view-transition-name", "article-title");

    router.visit(href, {
      viewTransition: (transition) => {
        void transition.finished.finally(cleanup);
      },
      onCancel: cleanup,
      onError: () => cleanup(),
    });
  };

  return (
    <Layout
      flash={flash}
      headerAction={(
        <IconButton
          type="button"
          label={query ? `Search notes. Current search: ${query}` : "Search notes"}
          icon={<SearchIcon />}
          variant="ghost"
          className="search-trigger"
          aria-controls="note-search-dialog"
          aria-expanded={isSearchOpen}
          aria-haspopup="dialog"
          data-has-query={Boolean(query)}
          onClick={openSearch}
        />
      )}
    >
      <Head title="Journal">
        <meta head-key="description" name="description" content={JOURNAL_DESCRIPTION} />
      </Head>
      <section className="page-intro">
        <Heading level={1} type="display-3" textWrap="balance">Published notes</Heading>
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
              onClick={clearSearch}
            />
          ) : null}
        </div>
      </section>

      <Dialog
        id="note-search-dialog"
        aria-label="Search notes"
        ref={searchDialogRef}
        className={`search-dialog${isSearchClosePreparing ? " search-dialog--preparing" : ""}${isSearchClosing ? " search-dialog--closing" : ""}`}
        isOpen={isSearchOpen}
        onOpenChange={(nextIsOpen) => {
          if (!nextIsOpen) closeSearch();
        }}
        onTransitionEnd={(event) => {
          if (
            !isSearchClosing ||
            event.target !== event.currentTarget ||
            event.propertyName !== "opacity"
          ) return;
          finishSearchClose();
        }}
        purpose="info"
        padding={4}
        position={{
          top: "max(4.5rem, calc(env(safe-area-inset-top) + 1.5rem))",
          start: 0,
          end: 0,
        }}
        width="min(36rem, calc(100vw - 1.875rem - env(safe-area-inset-left) - env(safe-area-inset-right)))"
      >
        <form onSubmit={submit} role="search" className="search-dialog-form" aria-busy={isSearching}>
          <div className="search-dialog-heading">
            <Heading level={2}>Search notes</Heading>
            <IconButton
              type="button"
              label="Close search"
              icon={<CloseIcon />}
              variant="ghost"
              className="dialog-close"
              onClick={closeSearch}
            />
          </div>
          <Text type="supporting" color="secondary" as="p">
            Find a note by title or summary.
          </Text>
          <TextInput
            label="Search notes"
            isLabelHidden
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Title or summary"
            startIcon={<SearchIcon />}
            hasAutoFocus
            hasClear
            width="100%"
          />
          <div className="search-dialog-actions">
            <Button
              type="submit"
              label="Search"
              variant="primary"
              isLoading={isSearching}
              isInterruptible
            />
          </div>
        </form>
      </Dialog>

      <section aria-label="Published notes" className="journal-section">
        <div className="journal-list">
          {posts.items.map((post: PublicPostSummary) => (
            <article className="journal-entry" key={post.id}>
              <div className="entry-title-row">
                <Heading level={2}>
                  <Link
                    className="story-link"
                    href={`/posts/${post.slug}`}
                    prefetch="hover"
                    cacheFor="30s"
                    onClick={(event) => openPost(event, `/posts/${post.slug}`)}
                  >
                    {post.title}
                  </Link>
                </Heading>
                <span className="entry-leader" aria-hidden="true" />
                <time className="entry-date" dateTime={post.publishedAt}>{publishedDate(post.publishedAt, "short")}</time>
              </div>
              <Text as="p" color="secondary" className="entry-excerpt">{post.excerpt}</Text>
            </article>
          ))}
        </div>
      </section>

      {posts.items.length === 0 ? (
        <EmptyState
          title={query ? "No notes match your search" : "No published notes yet"}
          description={query ? "Try another title or summary, or clear the search." : "Published notes will appear here."}
          headingLevel={2}
          actions={query ? <Button label="Clear search" variant="secondary" onClick={clearSearch} /> : undefined}
        />
      ) : null}

      <nav aria-label="Pagination" className="pagination">
        {posts.page > 1 ? (
          <Link
            className="pagination-link"
            href="/"
            data={{ page: posts.page - 1, q: query || undefined }}
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
            href="/"
            data={{ page: posts.page + 1, q: query || undefined }}
            only={partialProps}
            preserveState
            preserveScroll
          >
            Next
          </Link>
        ) : <span />}
      </nav>
    </Layout>
  );
}
