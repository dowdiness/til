import { Head, router } from "@inertiajs/react";
import { useRef, useState, type MouseEvent } from "react";
import { Layout } from "../../components/Layout";
import { PublicLedger } from "../../components/PublicLedger";
import { PublicSearchDialog } from "../../components/PublicSearchDialog";
import type { PageProps } from "../../pages.gen";
import { JOURNAL_DESCRIPTION } from "../../../lib/page-head";
import { serializePublicSearch } from "../../../lib/search-params";

type Props = PageProps<"Posts/Index">;

const partialProps = ["posts", "query", "errors", "flash"];

export default function Index({ posts, query, flash }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const visitCounter = useRef(0);

  const visit = (nextQuery: string | undefined, onSuccess?: () => void) => {
    const visitId = ++visitCounter.current;
    setIsSearching(true);
    const href = serializePublicSearch("/", { q: nextQuery ?? null, page: null });

    router.get(href, {}, {
      only: partialProps,
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onSuccess,
      onFinish: () => {
        if (visitCounter.current === visitId) setIsSearching(false);
      },
    });
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
        <PublicSearchDialog
          query={query}
          isSearching={isSearching}
          onSearch={(nextQuery, onSuccess) => {
            void visit(nextQuery, onSuccess);
          }}
        />
      )}
    >
      <Head title="Journal">
        <meta head-key="description" name="description" content={JOURNAL_DESCRIPTION} />
      </Head>
      <PublicLedger
        posts={posts}
        query={query}
        isSearching={isSearching}
        onClear={() => void visit(undefined)}
        onOpenPost={openPost}
      />
    </Layout>
  );
}
