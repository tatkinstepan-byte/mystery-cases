import {
  buildTelegramResponse,
  parseTelegramUpdate,
  validateTelegramWebhookSecret
} from "./bot.js";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(message);
  }
}

const start = parseTelegramUpdate({
  update_id: 1,
  message: {
    chat: { id: 100 },
    from: { id: 200 },
    text: "/start"
  }
});

assert(
  start?.type === "start",
  "START command must parse"
);

const startPayload = parseTelegramUpdate({
  update_id: 2,
  message: {
    chat: { id: 100 },
    from: { id: 200 },
    text: "/start last-message"
  }
});

assert(
  startPayload?.type === "start" &&
    startPayload.payload === "last-message",
  "START payload must parse"
);

const caseCommand = parseTelegramUpdate({
  update_id: 3,
  message: {
    chat: { id: 100 },
    from: { id: 200 },
    text: "/case last-message"
  }
});

assert(
  caseCommand?.type === "case" &&
    caseCommand.caseId === "last-message",
  "CASE command must parse"
);

const unknown = parseTelegramUpdate({
  update_id: 4,
  message: {
    chat: { id: 100 },
    from: { id: 200 },
    text: "/hello"
  }
});

assert(
  unknown?.type === "unknown",
  "Unknown command must parse"
);

const response = buildTelegramResponse({
  type: "start",
  chatId: "100",
  userId: "200"
});

assert(
  response.text.includes("MYSTERY CASES"),
  "START response must contain product name"
);

process.env.TELEGRAM_WEBHOOK_SECRET =
  "0123456789abcdef0123456789abcdef";

assert(
  validateTelegramWebhookSecret({
    "x-telegram-bot-api-secret-token":
      "0123456789abcdef0123456789abcdef"
  }),
  "Valid webhook secret must pass"
);

assert(
  !validateTelegramWebhookSecret({
    "x-telegram-bot-api-secret-token":
      "wrong-secret"
  }),
  "Invalid webhook secret must fail"
);

console.log("TELEGRAM BOT UNIT TESTS: PASS");
