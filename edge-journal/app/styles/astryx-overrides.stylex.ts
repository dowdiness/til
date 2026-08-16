import * as stylex from "@stylexjs/stylex";

const narrow = "@media (max-width: 43.75rem)";
const mobile = "@media (max-width: 31.25rem)";
const coarsePointer = "@media (hover: none), (pointer: coarse)";
export const astryxOverrides = stylex.create({
  brandLink: {
    color: "var(--color-text-accent)",
    fontSize: "1.125rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    textDecoration: "none",
    opacity: {
      default: 1,
      ":active": 0.55,
    },
    transitionDuration: "80ms",
    transitionProperty: "opacity",
    transitionTimingFunction: "ease-out",
  },
  iconButton: {
    minWidth: "2rem",
    paddingInline: "0.45rem",
    color: {
      default: "var(--color-text-secondary)",
      ":hover": "var(--color-text-primary)",
      ":focus-visible": "var(--color-text-primary)",
    },
  },
  activeIconButton: {
    color: "var(--color-text-primary)",
  },
  searchDialog: {
    marginInline: "auto",
    borderColor: "var(--color-border-emphasized)",
    borderRadius: "var(--radius-container)",
    borderStyle: "solid",
    borderWidth: "1px",
    backgroundColor: "var(--color-background-card)",
    backgroundImage: "url('/paper-grain.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "96px 96px",
    boxShadow: "none",
    color: "var(--color-text-primary)",
    transitionDuration: "var(--duration-medium-min)",
    transitionProperty: "opacity, transform",
    transitionTimingFunction: "var(--ease-out)",
  },
  searchDialogOpen: {
    animationDuration: "var(--duration-medium-min)",
    animationTimingFunction: "var(--ease-out)",
  },
  searchDialogPreparing: {
    animationName: "none",
  },
  touchTextInput: {
    height: {
      default: null,
      [coarsePointer]: "2.75rem",
    },
    minHeight: {
      default: null,
      [coarsePointer]: "2.75rem",
    },
    paddingBlock: {
      default: null,
      [coarsePointer]: 0,
    },
  },
  resultCount: {
    margin: 0,
  },
  paginationSlot: {
    justifySelf: {
      default: null,
      [mobile]: "center",
    },
  },
  paginationEndSlot: {
    justifySelf: {
      default: "end",
      [mobile]: "center",
    },
  },
  entryExcerpt: {
    maxWidth: "68ch",
    marginBlock: 0,
    marginTop: {
      default: "0.2rem",
      [mobile]: "0.45rem",
    },
    paddingRight: {
      default: 0,
      [narrow]: "1.5rem",
      [mobile]: 0,
    },
    fontSize: "0.8125rem",
    lineHeight: 1.55,
    textWrap: "pretty",
  },
  unsavedNotice: {
    margin: 0,
    padding: "0.75rem",
    borderColor: "var(--color-rule-strong)",
    borderRadius: "var(--radius-element)",
    borderStyle: "dotted",
    borderWidth: "1px",
    backgroundColor: "var(--color-background-unsaved)",
  },
  articleTitle: {
    viewTransitionName: "article-title",
  },
});
