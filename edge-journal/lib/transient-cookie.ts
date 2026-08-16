import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import type { Context } from "hono";
import type { FieldErrors } from "../domain/post-validation";

const COOKIE_NAME = "edge_journal_notice";
const MAX_VALUE_BYTES = 1500;
const MAX_AGE = 60;
export type Notice = { errors?: FieldErrors; flash?: string };

function encode(value: Notice): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function decode(value: string): Notice | null {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed !== "object" || parsed === null) return null;
    const notice: Notice = {};
    if ("flash" in parsed && typeof parsed.flash === "string") notice.flash = parsed.flash;
    if ("errors" in parsed && typeof parsed.errors === "object" && parsed.errors !== null) {
      const errors: FieldErrors = {};
      for (const [key, field] of Object.entries(parsed.errors)) if (typeof field === "string") errors[key] = field;
      notice.errors = errors;
    }
    return notice;
  } catch {
    return null;
  }
}
function options(c: Context) {
  return { httpOnly: true, sameSite: "Lax" as const, path: "/", maxAge: MAX_AGE, secure: new URL(c.req.url).protocol === "https:" };
}
export async function readNotice(c: Context, secret: string): Promise<Notice> {
  const value = await getSignedCookie(c, secret, COOKIE_NAME);
  if (value === undefined) return {};
  deleteCookie(c, COOKIE_NAME, options(c));
  if (value === false || value.length > MAX_VALUE_BYTES) return {};
  return decode(value) ?? {};
}
export async function setNotice(c: Context, secret: string, notice: Notice): Promise<void> {
  const value = encode(notice);
  if (value.length > MAX_VALUE_BYTES) throw new Error("notice too large");
  await setSignedCookie(c, COOKIE_NAME, value, secret, options(c));
}
