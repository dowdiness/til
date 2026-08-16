import { Button } from "@astryxdesign/core/Button";
import { Dialog } from "@astryxdesign/core/Dialog";
import { Heading } from "@astryxdesign/core/Heading";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { astryxOverrides } from "../styles/astryx-overrides.stylex";

type SearchPhase = "closed" | "open" | "preparing" | "closing";

type Props = {
  query: string;
  isSearching: boolean;
  onSearch: (query: string | undefined, onSuccess: () => void) => void;
};

type SearchFormProps = {
  query: string;
  isSearching: boolean;
  onClose: () => void;
  onSubmit: (query: string | undefined) => void;
};

function SearchForm({ query, isSearching, onClose, onSubmit }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(query);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchQuery.trim();
    onSubmit(nextQuery || undefined);
  };

  return (
    <form onSubmit={submit} role="search" className="grid gap-4" aria-busy={isSearching}>
      <div className="flex items-center justify-between gap-6 border-b border-dotted border-rule pb-3">
        <Heading level={2} xstyle={astryxOverrides.searchDialogHeading}>Search notes</Heading>
        <IconButton
          type="button"
          label="Close search"
          icon={<Icon icon="close" size="sm" />}
          variant="ghost"
          xstyle={astryxOverrides.iconButton}
          onClick={onClose}
        />
      </div>
      <Text type="supporting" color="secondary" as="p" xstyle={astryxOverrides.searchDialogHelp}>
        Find a note by title or summary.
      </Text>
      <TextInput
        label="Search notes"
        isLabelHidden
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Title or summary"
        startIcon={<Icon icon="search" size="sm" />}
        hasAutoFocus
        hasClear
        width="100%"
        xstyle={astryxOverrides.touchTextInput}
      />
      <div className="flex justify-end pt-1 max-narrow:[&>button]:w-full">
        <Button
          type="submit"
          label="Search"
          variant="primary"
          isLoading={isSearching}
          isInterruptible
          xstyle={astryxOverrides.compactAction}
        />
      </div>
    </form>
  );
}

export function PublicSearchDialog({ query, isSearching, onSearch }: Props) {
  const [phase, setPhase] = useState<SearchPhase>("closed");
  const searchTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchDialogRef = useRef<HTMLDialogElement | null>(null);
  const shouldRestoreFocus = useRef(false);
  const isOpen = phase !== "closed";
  const isClosing = phase === "closing";

  useEffect(() => {
    if (phase !== "preparing") return;
    const frame = requestAnimationFrame(() => setPhase("closing"));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== "closed" || !shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    searchTriggerRef.current?.focus();
  }, [phase]);

  const closeSearch = () => {
    if (
      !isOpen ||
      phase === "preparing" ||
      isClosing ||
      !searchDialogRef.current?.open
    ) return;
    shouldRestoreFocus.current = true;
    setPhase("preparing");
  };

  return (
    <>
      <IconButton
        ref={searchTriggerRef}
        type="button"
        label={query ? `Search notes. Current search: ${query}` : "Search notes"}
        icon={<Icon icon="search" size="sm" />}
        variant="ghost"
        xstyle={[
          astryxOverrides.iconButton,
          query ? astryxOverrides.activeIconButton : null,
        ]}
        aria-controls="note-search-dialog"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-has-query={Boolean(query)}
        onClick={() => setPhase("open")}
      />
      <Dialog
        id="note-search-dialog"
        aria-label="Search notes"
        ref={searchDialogRef}
        className={`search-dialog${isClosing ? " search-dialog--closing" : ""}`}
        xstyle={[
          astryxOverrides.searchDialog,
          isOpen ? astryxOverrides.searchDialogOpen : null,
          phase === "preparing" ? astryxOverrides.searchDialogPreparing : null,
        ]}
        isOpen={isOpen}
        onOpenChange={(nextIsOpen) => {
          if (!nextIsOpen) closeSearch();
        }}
        onTransitionEnd={(event) => {
          if (
            !isClosing ||
            event.target !== event.currentTarget ||
            event.propertyName !== "opacity"
          ) return;
          setPhase("closed");
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
        <SearchForm
          key={query}
          query={query}
          isSearching={isSearching}
          onClose={closeSearch}
          onSubmit={(nextQuery) => onSearch(nextQuery, closeSearch)}
        />
      </Dialog>
    </>
  );
}
