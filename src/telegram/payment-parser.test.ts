import { parseTelegramUpdate } from "./bot.js";

const preCheckout = parseTelegramUpdate({
  update_id: 100,
  pre_checkout_query: {
    id: "query-123",
    from: {
      id: 777
    },
    currency: "XTR",
    total_amount: 10,
    invoice_payload: "case:last-message"
  }
});

if (!preCheckout || preCheckout.type !== "pre_checkout") {
  throw new Error("pre_checkout parser test failed");
}

if (preCheckout.queryId !== "query-123") {
  throw new Error("pre_checkout query id test failed");
}

if (preCheckout.userId !== "777") {
  throw new Error("pre_checkout user id test failed");
}

if (preCheckout.currency !== "XTR") {
  throw new Error("pre_checkout currency test failed");
}

if (preCheckout.totalAmount !== 10) {
  throw new Error("pre_checkout amount test failed");
}

if (preCheckout.invoicePayload !== "case:last-message") {
  throw new Error("pre_checkout payload test failed");
}

const successfulPayment = parseTelegramUpdate({
  update_id: 101,
  message: {
    message_id: 55,
    chat: {
      id: 777,
      type: "private"
    },
    from: {
      id: 777
    },
    successful_payment: {
      currency: "XTR",
      total_amount: 10,
      invoice_payload: "case:last-message",
      telegram_payment_charge_id: "charge-123"
    }
  }
});

if (
  !successfulPayment ||
  successfulPayment.type !== "successful_payment"
) {
  throw new Error("successful_payment parser test failed");
}

if (successfulPayment.chatId !== "777") {
  throw new Error("successful_payment chat id test failed");
}

if (successfulPayment.userId !== "777") {
  throw new Error("successful_payment user id test failed");
}

if (successfulPayment.currency !== "XTR") {
  throw new Error("successful_payment currency test failed");
}

if (successfulPayment.totalAmount !== 10) {
  throw new Error("successful_payment amount test failed");
}

if (
  successfulPayment.invoicePayload !==
  "case:last-message"
) {
  throw new Error("successful_payment payload test failed");
}

if (
  successfulPayment.telegramPaymentChargeId !==
  "charge-123"
) {
  throw new Error(
    "successful_payment charge id test failed"
  );
}

const invalidPayment = parseTelegramUpdate({
  update_id: 102,
  message: {
    chat: {
      id: 777
    },
    from: {
      id: 777
    },
    successful_payment: {
      currency: "XTR",
      total_amount: 10,
      invoice_payload: "case:last-message"
    }
  }
});

if (invalidPayment !== undefined) {
  throw new Error(
    "invalid successful_payment should not be accepted"
  );
}

console.log("P0.09.2 PAYMENT PARSER TEST: PASS");
