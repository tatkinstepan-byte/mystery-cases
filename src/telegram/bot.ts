import { processSuccessfulCasePayment } from "./payment-entitlement.js";

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
    successful_payment?: {
      currency?: string;
      total_amount?: number;
      invoice_payload?: string;
      telegram_payment_charge_id?: string;
    };
  };
  pre_checkout_query?: {
    id?: string;
    from?: {
      id?: number;
    };
    currency?: string;
    total_amount?: number;
    invoice_payload?: string;
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
      type: "pre_checkout";
      queryId: string;
      userId: string;
      currency: string;
      totalAmount: number;
      invoicePayload: string;
    }
  | {
      type: "successful_payment";
      chatId: string;
      userId: string;
      currency: string;
      totalAmount: number;
      invoicePayload: string;
      telegramPaymentChargeId: string;
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
  const preCheckout = update.pre_checkout_query;

  if (
    preCheckout &&
    typeof preCheckout.id === "string" &&
    typeof preCheckout.from?.id === "number" &&
    typeof preCheckout.currency === "string" &&
    typeof preCheckout.total_amount === "number" &&
    typeof preCheckout.invoice_payload === "string"
  ) {
    return {
      type: "pre_checkout",
      queryId: preCheckout.id,
      userId: String(preCheckout.from.id),
      currency: preCheckout.currency,
      totalAmount: preCheckout.total_amount,
      invoicePayload: preCheckout.invoice_payload,
    };
  }

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

  const payment = message.successful_payment;

  if (
    payment &&
    typeof payment.currency === "string" &&
    typeof payment.total_amount === "number" &&
    typeof payment.invoice_payload === "string" &&
    typeof payment.telegram_payment_charge_id === "string"
  ) {
    return {
      type: "successful_payment",
      chatId,
      userId,
      currency: payment.currency,
      totalAmount: payment.total_amount,
      invoicePayload: payment.invoice_payload,
      telegramPaymentChargeId:
        payment.telegram_payment_charge_id,
    };
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
  access?: "locked" | "unlocked",
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

    if (
      command.caseId === "last-message" &&
      access === "unlocked"
    ) {
      return {
        text:
          "<b>Последнее сообщение</b>\n\n" +
          "Доступ к CASE открыт.\n\n" +
          "Следующий шаг — открыть расследование.",
        parseMode: "HTML",
      };
    }

    return {
      text:
        "<b>Последнее сообщение</b>\n\n" +
        "<b>Preview</b>\n\n" +
        "Тебя ждёт реальное расследование, где нужно восстановить ход событий по уликам.\n\n" +
        "Полный доступ к расследованию закрыт.",
      parseMode: "HTML",
    };
  }

  return {
    text:
      "Неизвестная команда.\n\n" +
      "Используй /start или /case.",
  };
}

export function processSuccessfulPaymentUpdate(
  update: TelegramUpdate,
): boolean {
  const payment = update.message?.successful_payment;
  const userId = update.message?.from?.id;

  if (!payment || typeof userId !== "number") {
    return false;
  }

  if (
    payment.currency !== "XTR" ||
    typeof payment.total_amount !== "number" ||
    !payment.invoice_payload ||
    !payment.telegram_payment_charge_id
  ) {
    return false;
  }

  const match = payment.invoice_payload.match(/^case:(.+)$/);

  if (!match) {
    return false;
  }

  const caseId = match[1];

  return processSuccessfulCasePayment(
    String(userId),
    caseId,
    {
      currency: "XTR",
      total_amount: payment.total_amount,
      invoice_payload: payment.invoice_payload,
      telegram_payment_charge_id:
        payment.telegram_payment_charge_id,
    },
  ).unlocked;
}
