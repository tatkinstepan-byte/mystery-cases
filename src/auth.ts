import type { IncomingHttpHeaders } from "node:http";

export function getUserIdFromHeaders(
  headers: IncomingHttpHeaders
): string | undefined {
  const authorization = headers.authorization;

  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return undefined;
  }

  return token;
}
