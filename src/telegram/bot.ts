import type { IncomingHttpHeaders } from "node:http";

export type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id?: number;
      type?: string;
    };
    from?: {
      id?: number;
      first_name?: string;
      username?: string;
    };
  };
};

export type TelegramCommand =
  | {
      type: "start";
      chatId: string;
      userId: string;
      payload?: string;
    }
  | {
      type: "case";
      chatId: string;
      userId: string;
      caseId?: string;
    }
  | {
      type: "unknown";
      chatId: string;
      userId: string;
      text: string;
    };

export function getTelegramWebhookSecret(): string | undefined {
  const value = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!value || value.length < 16) {
    return undefined;
  }

  return value;
}

export function validateTelegramWebhookSecret(
  headers: IncomingHttpHeaders,
): boolean {
  const expected = getTelegramWebhookSecret();

  if (!expected) {
    return false;
  }

  const received = headers["x-telegram-bot-api-secret-token"];

  const receivedValue = Array.isArray(received)
    ? received[0]
    : received;

  return receivedValue === expected;
}

export function parseTelegramUpdate(
  update: TelegramUpdate,
): TelegramCommand | undefined {
  const message = update.message;

  if (!message) {
    return undefined;
  }

  const chatId =
    typeof message.chat?.id === "number"
      ? String(message.chat.id)
      : undefined;

  const userId =
    typeof message.from?.id === "number"
      ? String(message.from.id)
      : undefined;

  if (!chatId || !userId) {
    return undefined;
  }

  const text = message.text?.trim();

  if (!text) {
    return undefined;
  }

  if (text === "/start") {
    return {
      type: "start",
      chatId,
      userId,
    };
  }

  if (text.startsWith("/start ")) {
    const payload = text.slice(7).trim();

    return {
      type: "start",
      chatId,
      userId,
      payload: payload || undefined,
    };
  }

  if (text === "/case") {
    return {
      type: "case",
      chatId,
      userId,
    };
  }

  if (text.startsWith("/case ")) {
    const caseId = text.slice(6).trim();

    return {
      type: "case",
      chatId,
      userId,
      caseId: caseId || undefined,
    };
  }

  return {
    type: "unknown",
    chatId,
    userId,
    text,
  };
}

export function buildTelegramResponse(
  command: TelegramCommand,
): {
  text: string;
  parseMode?: "HTML";
} {
  if (command.type === "start") {
    return {
      text:
        "<b>MYSTERY CASES⭐️</b>\n\n" +
        "Добро пожаловать.\n\n" +
        "Здесь тебя ждут реальные расследования, " +
        "где разгадка не лежит на поверхности.\n\n" +
        "Используй /case, чтобы открыть доступный CASE.",
      parseMode: "HTML",
    };
  }

  if (command.type === "case") {
    if (!command.caseId) {
      return {
        text:
          "<b>CASE</b>\n\n" +
          "Укажи CASE, например:\n" +
          "<code>/case last-message</code>",
        parseMode: "HTML",
      };
    }

    return {
      text:
        "<b>Последнее сообщение</b>\n\n" +
        "CASE найден.\n\n" +
        "Следующий шаг — открыть расследование.",
      parseMode: "HTML",
    };
  }

  return {
    text:
      "Неизвестная команда.\n\n" +
      "Используй /start или /case.",
  };
}
