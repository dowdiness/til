import type { PostStatus } from "../../domain/post";

/** Static Tailwind variants: keep utility extraction explicit and type-safe. */
export const postStatusClassName: Record<PostStatus, string> = {
  draft: "flex-none whitespace-nowrap text-label text-draft capitalize",
  published: "flex-none whitespace-nowrap text-label text-published capitalize",
};
