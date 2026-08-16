type HeadPage = {
  component: string;
  props: Record<string, unknown>;
};

type PageMetadata = {
  title: string;
  description?: string;
  robots?: "noindex, nofollow";
};

export const JOURNAL_DESCRIPTION =
  "Short observations on software, systems, and making technical work easier to understand.";

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function postText(page: HeadPage, key: "title" | "excerpt"): string | null {
  const post = record(page.props.post);
  const value = post?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function resolvePageMetadata(page: HeadPage): PageMetadata {
  switch (page.component) {
    case "Posts/Index":
      return { title: "Journal", description: JOURNAL_DESCRIPTION };
    case "Posts/Show":
      return {
        title: postText(page, "title") ?? "Edge Journal",
        description: postText(page, "excerpt") ?? undefined,
      };
    case "Admin/Posts/Index":
      return { title: "Admin posts", robots: "noindex, nofollow" };
    case "Admin/Posts/New":
      return { title: "New post", robots: "noindex, nofollow" };
    case "Admin/Posts/Edit": {
      const title = postText(page, "title");
      return { title: title ? `Edit ${title}` : "Edit post", robots: "noindex, nofollow" };
    }
    case "Errors/NotFound":
      return { title: "Not found", robots: "noindex, nofollow" };
    case "Errors/InternalServerError":
      return { title: "Something went wrong", robots: "noindex, nofollow" };
    default:
      return { title: "Edge Journal" };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

export function resolvePageHead(page: HeadPage): string[] {
  const metadata = resolvePageMetadata(page);
  const head = [`<title data-inertia="">${escapeHtml(metadata.title)}</title>`];

  if (metadata.description) {
    head.push(`<meta name="description" content="${escapeHtml(metadata.description)}" data-inertia="description">`);
  }
  if (metadata.robots) {
    head.push(`<meta name="robots" content="${metadata.robots}" data-inertia="robots">`);
  }

  return head;
}
