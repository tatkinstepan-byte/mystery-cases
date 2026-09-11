type EntitlementKey = `${string}:${string}`;

const entitlements = new Set<EntitlementKey>([
  "dev-test:last-message",
  "1:last-message",
]);

export function hasEntitlement(
  userId: string,
  caseId: string
): boolean {
  return entitlements.has(`${userId}:${caseId}`);
}
