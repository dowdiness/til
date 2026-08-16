const paragraphBreak = /\r?\n(?:[\t ]*\r?\n)+/;

export function articleBodyParagraphs(body: string): string[] {
  return body.split(paragraphBreak);
}
