import { sendTelegramInvoice } from "./api.js";

const originalFetch = globalThis.fetch;
const originalToken = process.env.TELEGRAM_BOT_TOKEN;

process.env.TELEGRAM_BOT_TOKEN = "test-token";

let capturedUrl = "";
let capturedBody: unknown = undefined;

globalThis.fetch = async (input, init) => {
  capturedUrl = String(input);
  capturedBody = init?.body
    ? JSON.parse(String(init.body))
    : undefined;

  return new Response(
    JSON.stringify({
      ok: true,
      result: { message_id: 123 }
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

try {
  const result = await sendTelegramInvoice("100", {
    title: "Последнее сообщение",
    description: "Открыть CASE",
    payload: "case:last-message",
    currency: "XTR",
    prices: [
      {
        label: "CASE",
        amount: 10
      }
    ]
  });

  if (!result.ok) {
    throw new Error("sendInvoice result test failed");
  }

  if (
    capturedUrl !==
    "https://api.telegram.org/bottest-token/sendInvoice"
  ) {
    throw new Error("sendInvoice URL test failed");
  }

  const body = capturedBody as Record<string, unknown>;

  if (body.chat_id !== "100") {
    throw new Error("chat_id test failed");
  }

  if (body.title !== "Последнее сообщение") {
    throw new Error("title test failed");
  }

  if (body.payload !== "case:last-message") {
    throw new Error("payload test failed");
  }

  if (body.currency !== "XTR") {
    throw new Error("currency test failed");
  }

  if (body.provider_token !== "") {
    throw new Error("provider_token test failed");
  }

  const prices =
    body.prices as Array<{
      label: string;
      amount: number;
    }>;

  if (
    prices.length !== 1 ||
    prices[0].label !== "CASE" ||
    prices[0].amount !== 10
  ) {
    throw new Error("prices test failed");
  }

  console.log("P0.08.3 SEND INVOICE UNIT TEST: PASS");
} finally {
  globalThis.fetch = originalFetch;

  if (originalToken === undefined) {
    delete process.env.TELEGRAM_BOT_TOKEN;
  } else {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }
}
