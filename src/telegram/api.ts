export type TelegramSendMessageResult = {
  ok: boolean;
  result?: unknown;
  description?: string;
};

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode?: "HTML"
): Promise<TelegramSendMessageResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {})
      })
    }
  );

  const data =
    (await response.json()) as TelegramSendMessageResult;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.description ?? "Telegram sendMessage failed"
    );
  }

  return data;
}


export type TelegramSendInvoiceResult = {
  ok: boolean;
  result?: unknown;
  description?: string;
};

export async function sendTelegramInvoice(
  chatId: string,
  invoice: {
    title: string;
    description: string;
    payload: string;
    currency: "XTR";
    prices: Array<{
      label: string;
      amount: number;
    }>;
  }
): Promise<TelegramSendInvoiceResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendInvoice`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        title: invoice.title,
        description: invoice.description,
        payload: invoice.payload,
        provider_token: "",
        currency: invoice.currency,
        prices: invoice.prices
      })
    }
  );

  const data =
    (await response.json()) as TelegramSendInvoiceResult;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.description ?? "Telegram sendInvoice failed"
    );
  }

  return data;
}
