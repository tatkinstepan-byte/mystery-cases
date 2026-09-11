import {
  answerTelegramPreCheckoutQuery
} from "./api.js";

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
      result: true
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};

try {
  const result =
    await answerTelegramPreCheckoutQuery(
      "query-123",
      true
    );

  if (!result.ok) {
    throw new Error(
      "pre_checkout success response test failed"
    );
  }

  if (
    capturedUrl !==
    "https://api.telegram.org/bottest-token/answerPreCheckoutQuery"
  ) {
    throw new Error(
      "pre_checkout API URL test failed"
    );
  }

  const body = capturedBody as {
    pre_checkout_query_id?: string;
    ok?: boolean;
    error_message?: string;
  };

  if (body.pre_checkout_query_id !== "query-123") {
    throw new Error(
      "pre_checkout query id test failed"
    );
  }

  if (body.ok !== true) {
    throw new Error(
      "pre_checkout ok test failed"
    );
  }

  if ("error_message" in body) {
    throw new Error(
      "error_message should be omitted on success"
    );
  }

  const rejectResult =
    await answerTelegramPreCheckoutQuery(
      "query-456",
      false,
      "Payment validation failed"
    );

  if (!rejectResult.ok) {
    throw new Error(
      "pre_checkout rejection response test failed"
    );
  }

  const rejectBody = capturedBody as {
    pre_checkout_query_id?: string;
    ok?: boolean;
    error_message?: string;
  };

  if (rejectBody.ok !== false) {
    throw new Error(
      "pre_checkout rejection ok test failed"
    );
  }

  if (
    rejectBody.error_message !==
    "Payment validation failed"
  ) {
    throw new Error(
      "pre_checkout error message test failed"
    );
  }

  console.log(
    "P0.09.4 PRE-CHECKOUT TEST: PASS"
  );
} finally {
  globalThis.fetch = originalFetch;

  if (originalToken === undefined) {
    delete process.env.TELEGRAM_BOT_TOKEN;
  } else {
    process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }
}
