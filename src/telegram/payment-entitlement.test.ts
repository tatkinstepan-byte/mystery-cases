import {
  processSuccessfulCasePayment
} from "./payment-entitlement.js";

import {
  hasCaseEntitlement
} from "../data/entitlements.js";

async function main(): Promise<void> {
  const userId = "payment-test-user";
  const caseId = "last-message";

  const payment = {
    currency: "XTR" as const,
    total_amount: 10,
    invoice_payload: `case:${caseId}`,
    telegram_payment_charge_id: "charge-test-001"
  };

  if (hasCaseEntitlement(userId, caseId)) {
    throw new Error("Test user already has entitlement");
  }

  const result = processSuccessfulCasePayment(
    userId,
    caseId,
    payment
  );

  if (!result.unlocked) {
    throw new Error("CASE was not unlocked");
  }

  if (result.userId !== userId) {
    throw new Error("USER ID mismatch");
  }

  if (result.caseId !== caseId) {
    throw new Error("CASE ID mismatch");
  }

  if (
    result.telegramPaymentChargeId !==
    "charge-test-001"
  ) {
    throw new Error("PAYMENT CHARGE ID mismatch");
  }

  if (!hasCaseEntitlement(userId, caseId)) {
    throw new Error("Entitlement was not granted");
  }

  let invalidPaymentPassed = false;

  try {
    processSuccessfulCasePayment(
      "invalid-payment-user",
      caseId,
      {
        ...payment,
        invoice_payload: "case:wrong-case"
      }
    );
  } catch (error) {
    invalidPaymentPassed =
      error instanceof Error &&
      error.message === "INVALID_SUCCESSFUL_PAYMENT";
  }

  if (!invalidPaymentPassed) {
    throw new Error(
      "Invalid payment validation test failed"
    );
  }

  console.log(
    "P0.09.6 SUCCESSFUL PAYMENT → ENTITLEMENT TEST: PASS"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
