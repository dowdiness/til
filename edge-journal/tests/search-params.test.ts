import { describe, expect, it } from "vitest";
import {
  adminSearchParams,
  loadAdminSearchParams,
  loadPublicSearchParams,
  serializeAdminSearch,
  serializePublicSearch,
} from "../lib/search-params";

describe("search parameter definitions", () => {
  it("serializes public query and pagination values together", () => {
    expect(serializePublicSearch("/", { q: "quiet systems", page: 2 }))
      .toBe("/?q=quiet+systems&page=2");
    expect(serializePublicSearch("/", { q: null, page: 3 })).toBe("/?page=3");
  });

  it("parses request search parameters with typed defaults", () => {
    expect(loadPublicSearchParams(new Request("https://example.test/?q=quiet&page=2")))
      .toEqual({ q: "quiet", page: 2 });
    expect(loadAdminSearchParams(new Request("https://example.test/?status=archived")))
      .toEqual({ q: "", status: "all" });
  });

  it("rejects unsupported admin statuses and clears default values", () => {
    expect(adminSearchParams.status.parse("draft")).toBe("draft");
    expect(adminSearchParams.status.parse("archived")).toBeNull();
    expect(serializeAdminSearch("/admin/posts", { q: "", status: "all" }))
      .toBe("/admin/posts");
  });
});
