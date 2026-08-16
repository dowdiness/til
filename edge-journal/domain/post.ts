export type PostStatus = "draft" | "published";

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: PostStatus;
};

export type PublicPostSummary = Readonly<{
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
}>;

export type PublicPost = Readonly<PublicPostSummary & {
  body: string;
}>;

export type AdminPostSummary = Readonly<{
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: PostStatus;
  updatedAt: string;
}>;

export type AdminPost = Readonly<PostInput & {
  id: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type DeletedPostSummary = Readonly<{
  id: number;
  title: string;
}>;

export function publicationTimestamp(
  previousStatus: PostStatus | null,
  nextStatus: PostStatus,
  previousPublishedAt: number | null,
  now: number,
): number | null {
  if (nextStatus === "draft") return null;
  if (previousStatus === "published") return previousPublishedAt;
  return now;
}
