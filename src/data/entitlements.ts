type EntitlementKey = `${string}:${string}`;

const entitlements = new Set<EntitlementKey>([
  "dev-test:last-message",
]);

export function hasEntitlement(
  userId: string,
  caseId: string
): boolean {
  return entitlements.has(`${userId}:${caseId}`);
}
