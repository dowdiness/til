export type ContentSecurityPolicyOptions = Readonly<{
  nonce: string;
  development?: boolean;
}>;

export function contentSecurityPolicy({ nonce, development = false }: ContentSecurityPolicyOptions): string {
  const scriptSources = development
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    : ["'self'", `'nonce-${nonce}'`];
  const connectSources = development ? ["'self'", "http:", "ws:"] : ["'self'"];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

export function requestNonce(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
