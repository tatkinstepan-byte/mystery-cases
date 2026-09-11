import { sendTelegramInvoice } from "./api.js";

const originalFetch = globalThis.fetch;
const originalToken = process.env.TELEGRAM_BOT_TOKEN;

process.env.TELEGRAM_BOT_TOKEN = "test-token";

globalThis.fetch = async () =>
  new Response(
    JSON.stringify({
      ok: false,
      description: "Bad Request"
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

try {
  let errorPassed = false;

  try {
    await sendTelegramInvoice("100", {
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
  } catch (error) {
    errorPassed =
      error instanceof Error &&
      error.message === "Bad Request";
  }

  if (!errorPassed) {
    throw new Error("Telegram invoice API error test failed");
  }

  console.log("P0.08.4 INVOICE ERROR TEST: PASS");
} finally {
  globalThis.fetch = originalFetch;

  if (originalToken === undefined) {
    delete process.env.TELEGRAM_BOT_TOKEN;
  } else {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }
}
