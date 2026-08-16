type PublishedDateStyle = "short" | "long";

const PUBLICATION_TIME_ZONE = "Asia/Tokyo";

export function publishedDate(value: string, style: PublishedDateStyle): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: style === "short" ? "short" : "long",
    day: "2-digit",
    timeZone: PUBLICATION_TIME_ZONE,
  }).format(new Date(value));
}
