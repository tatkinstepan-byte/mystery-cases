import {
  processSuccessfulCasePayment
} from "./payment-entitlement.js";

import {
  hasCaseEntitlement,
  getCaseEntitlement
} from "../data/entitlements.js";

async function main(): Promise<void> {
  const userId = "idempotency-test-user";
  const caseId = "last-message";

  const payment = {
    currency: "XTR" as const,
    total_amount: 10,
    invoice_payload: `case:${caseId}`,
    telegram_payment_charge_id: "charge-idempotency-001"
  };

  const first = processSuccessfulCasePayment(
    userId,
    caseId,
    payment
  );

  if (!first.unlocked) {
    throw new Error("First payment did not unlock CASE");
  }

  const storedAfterFirst =
    getCaseEntitlement(userId, caseId);

  if (
    !storedAfterFirst ||
    storedAfterFirst.telegramPaymentChargeId !==
      "charge-idempotency-001"
  ) {
    throw new Error(
      "First payment entitlement was not stored correctly"
    );
  }

  const secondPayment = {
    ...payment,
    telegram_payment_charge_id: "charge-idempotency-002"
  };

  const second = processSuccessfulCasePayment(
    userId,
    caseId,
    secondPayment
  );

  if (!second.unlocked) {
    throw new Error("Second payment lost existing entitlement");
  }

  const storedAfterSecond =
    getCaseEntitlement(userId, caseId);

  if (
    !storedAfterSecond ||
    storedAfterSecond.telegramPaymentChargeId !==
      "charge-idempotency-001"
  ) {
    throw new Error(
      "IDEMPOTENCY_FAIL: existing entitlement was overwritten"
    );
  }

  if (!hasCaseEntitlement(userId, caseId)) {
    throw new Error("CASE entitlement is missing");
  }

  console.log(
    "P0.10.1 PAYMENT IDEMPOTENCY TEST: PASS"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
