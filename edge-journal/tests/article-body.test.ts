import { describe, expect, it } from "vitest";
import { articleBodyParagraphs } from "../lib/article-body";

describe("articleBodyParagraphs", () => {
  it("turns blank-line-separated plain text into semantic paragraphs", () => {
    expect(articleBodyParagraphs("First paragraph.\n\nSecond paragraph.")).toEqual([
      "First paragraph.",
      "Second paragraph.",
    ]);
  });

  it("preserves intentional line breaks inside a paragraph", () => {
    expect(articleBodyParagraphs("First line.\nSecond line.\n\nLast paragraph.")).toEqual([
      "First line.\nSecond line.",
      "Last paragraph.",
    ]);
  });

  it("accepts blank lines containing whitespace and Windows line endings", () => {
    expect(articleBodyParagraphs("First.\r\n \t\r\nSecond.")).toEqual(["First.", "Second."]);
  });
});
