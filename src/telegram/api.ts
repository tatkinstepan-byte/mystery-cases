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
