import type { IncomingHttpHeaders } from "node:http";

export type UserIdentity = {
  userId: string;
};

export function getUserIdentityFromHeaders(
  headers: IncomingHttpHeaders,
): UserIdentity | undefined {
  const authorization = headers.authorization;

  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return undefined;
  }

  return {
    userId: token,
  };
}
