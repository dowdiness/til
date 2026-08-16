import * as stylex from "@stylexjs/stylex";

const narrow = "@media (max-width: 43.75rem)";
const mobile = "@media (max-width: 31.25rem)";
const coarsePointer = "@media (hover: none), (pointer: coarse)";
export const astryxOverrides = stylex.create({
  navLink: {
    color: {
      default: "var(--color-text-secondary)",
      ":hover": "var(--color-text-primary)",
      ":focus-visible": "var(--color-text-primary)",
    },
    fontSize: "0.8125rem",
    opacity: {
      default: 1,
      ":active": 0.55,
    },
    transitionDuration: "100ms",
    transitionProperty: "color, opacity",
    transitionTimingFunction: "var(--ease-out)",
  },
  currentNavLink: {
    color: "var(--color-text-primary)",
    textDecorationLine: "underline",
  },
  compactAction: {
    minWidth: "auto",
    paddingInline: "0.45rem",
  },
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
    transitionDuration: "100ms",
    transitionProperty: "opacity",
    transitionTimingFunction: "var(--ease-out)",
  },
  textLink: {
    textDecorationColor: {
      default: "var(--color-text-secondary)",
      ":hover": "currentColor",
      ":focus-visible": "currentColor",
    },
    transitionDuration: "100ms",
    transitionProperty: "color, text-decoration-color, opacity",
    transitionTimingFunction: "var(--ease-out)",
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
    transitionProperty: "opacity, transform, filter",
    transitionTimingFunction: "var(--ease-out)",
  },
  searchDialogHeading: {
    margin: 0,
    color: "var(--color-text-heading)",
    fontSize: "1rem",
    fontWeight: 500,
    letterSpacing: "-0.005em",
    lineHeight: 1.4,
  },
  searchDialogHelp: {
    marginBlock: 0,
    marginTop: "-0.25rem",
    marginBottom: "0.25rem",
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
  pagination: {
    fontVariantNumeric: "tabular-nums",
  },
  pageHeading: {
    margin: 0,
    color: "var(--color-text-heading)",
    fontSize: "1.25rem",
    fontWeight: 500,
    letterSpacing: "-0.012em",
    lineHeight: 1.35,
  },
  pageLead: {
    display: "block",
    maxWidth: "62ch",
    marginBlock: 0,
    marginTop: {
      default: "1.85rem",
      [mobile]: "1.5rem",
    },
    color: "var(--color-text-lead)",
    fontSize: "1.0625rem",
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1.7,
    textWrap: "pretty",
  },
  adminCount: {
    marginBlock: 0,
    marginTop: "0.4rem",
  },
  sectionHeading: {
    marginBlock: 0,
    marginBottom: "1rem",
    fontSize: "0.8125rem",
    fontWeight: 400,
  },
  entryTitle: {
    minWidth: 0,
    margin: 0,
    color: "var(--color-text-primary)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    letterSpacing: 0,
    lineHeight: 1.45,
    textWrap: "pretty",
  },
  formLead: {
    display: "block",
    maxWidth: "38rem",
    marginBlock: 0,
    marginTop: "1rem",
    fontWeight: 400,
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
  articleMeta: {
    marginBlock: 0,
    marginBottom: "1.25rem",
  },
  articleTitle: {
    maxWidth: "24ch",
    margin: 0,
    color: "#252525",
    fontSize: "clamp(2rem, 6vw, 2.65rem)",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    viewTransitionName: "article-title",
  },
  articleLead: {
    maxWidth: "60ch",
    marginBlock: 0,
    marginTop: "1.35rem",
    fontSize: "1.0625rem",
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1.7,
    textWrap: "pretty",
  },
});
