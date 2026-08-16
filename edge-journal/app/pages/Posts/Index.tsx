import { Head, router } from "@inertiajs/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
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
  const [isOpeningPost, setIsOpeningPost] = useState(false);
  const visitCounter = useRef(0);
  const openingStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishOpeningPost = () => {
    if (openingStatusTimer.current !== null) {
      clearTimeout(openingStatusTimer.current);
      openingStatusTimer.current = null;
    }
    setIsOpeningPost(false);
  };

  useEffect(() => () => {
    if (openingStatusTimer.current !== null) clearTimeout(openingStatusTimer.current);
  }, []);

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
    if (event.button !== 0 || isModifiedClick) return;

    event.preventDefault();
    openingStatusTimer.current = setTimeout(() => setIsOpeningPost(true), 150);

    const source = event.currentTarget;
    const shouldTransition =
      event.detail > 0 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "startViewTransition" in document;
    const cleanupTransition = () => source.style.removeProperty("view-transition-name");
    const finish = () => {
      cleanupTransition();
      finishOpeningPost();
    };

    if (shouldTransition) {
      source.style.setProperty("view-transition-name", "article-title");
      router.visit(href, {
        viewTransition: (transition) => {
          void transition.finished.finally(cleanupTransition);
        },
        onCancel: finish,
        onError: finish,
        onFinish: finishOpeningPost,
      });
      return;
    }

    router.visit(href, {
      onCancel: finishOpeningPost,
      onError: finishOpeningPost,
      onFinish: finishOpeningPost,
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
        isOpeningPost={isOpeningPost}
        onClear={() => void visit(undefined)}
        onOpenPost={openPost}
      />
    </Layout>
  );
}
