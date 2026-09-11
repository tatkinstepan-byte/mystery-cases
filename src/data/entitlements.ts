export type EntitlementKey = `${string}:${string}`;

export type PaymentEntitlement = {
  userId: string;
  caseId: string;
  telegramPaymentChargeId: string;
};

const entitlements = new Map<
  EntitlementKey,
  PaymentEntitlement
>();

function key(userId: string, caseId: string): EntitlementKey {
  return `${userId}:${caseId}`;
}

entitlements.set("dev-test:last-message", {
  userId: "dev-test",
  caseId: "last-message",
  telegramPaymentChargeId: "dev-test"
});

entitlements.set("1:last-message", {
  userId: "1",
  caseId: "last-message",
  telegramPaymentChargeId: "dev-test"
});

export function hasEntitlement(
  userId: string,
  caseId: string
): boolean {
  return entitlements.has(key(userId, caseId));
}

export function hasCaseEntitlement(
  userId: string,
  caseId: string
): boolean {
  return entitlements.has(key(userId, caseId));
}

export function grantCaseEntitlement(
  userId: string,
  caseId: string,
  telegramPaymentChargeId: string
): PaymentEntitlement {
  if (!userId) {
    throw new Error("USER_ID is required");
  }

  if (!caseId) {
    throw new Error("CASE_ID is required");
  }

  if (!telegramPaymentChargeId) {
    throw new Error(
      "TELEGRAM_PAYMENT_CHARGE_ID is required"
    );
  }

  const entitlement: PaymentEntitlement = {
    userId,
    caseId,
    telegramPaymentChargeId
  };

  entitlements.set(key(userId, caseId), entitlement);

  return entitlement;
}

export function getCaseEntitlement(
  userId: string,
  caseId: string
): PaymentEntitlement | undefined {
  return entitlements.get(key(userId, caseId));
}
