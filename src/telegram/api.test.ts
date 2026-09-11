import { sendTelegramMessage } from "./api.js";

async function main(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;

  try {
    delete process.env.TELEGRAM_BOT_TOKEN;

    let missingTokenPassed = false;

    try {
      await sendTelegramMessage("100", "test");
    } catch (error) {
      missingTokenPassed =
        error instanceof Error &&
        error.message === "TELEGRAM_BOT_TOKEN is not configured";
    }

    if (!missingTokenPassed) {
      throw new Error("Missing token test failed");
    }

    process.env.TELEGRAM_BOT_TOKEN = "test-token";

    let capturedUrl = "";
    let capturedBody = "";

    globalThis.fetch = async (
      input: string | URL | Request,
      init?: RequestInit
    ) => {
      capturedUrl = String(input);
      capturedBody = String(init?.body ?? "");

      return new Response(
        JSON.stringify({
          ok: true,
          result: {
            message_id: 123
          }
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    };

    const result = await sendTelegramMessage(
      "100",
      "<b>Hello</b>",
      "HTML"
    );

    if (!result.ok) {
      throw new Error("Telegram success response test failed");
    }

    if (
      capturedUrl !==
      "https://api.telegram.org/bottest-token/sendMessage"
    ) {
      throw new Error("Telegram API URL test failed");
    }

    const body = JSON.parse(capturedBody) as {
      chat_id?: string;
      text?: string;
      parse_mode?: string;
    };

    if (
      body.chat_id !== "100" ||
      body.text !== "<b>Hello</b>" ||
      body.parse_mode !== "HTML"
    ) {
      throw new Error("Telegram request body test failed");
    }

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

    let apiErrorPassed = false;

    try {
      await sendTelegramMessage("100", "test");
    } catch (error) {
      apiErrorPassed =
        error instanceof Error &&
        error.message === "Bad Request";
    }

    if (!apiErrorPassed) {
      throw new Error("Telegram API error test failed");
    }

    console.log("TELEGRAM API UNIT TESTS: PASS");
  } finally {
    globalThis.fetch = originalFetch;

    if (originalToken === undefined) {
      delete process.env.TELEGRAM_BOT_TOKEN;
    } else {
      process.env.TELEGRAM_BOT_TOKEN = originalToken;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
