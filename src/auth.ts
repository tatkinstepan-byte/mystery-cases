import type { IncomingHttpHeaders } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";

export type UserIdentity = {
  userId: string;
  source: "telegram" | "dev";
};

const DEV_TOKEN = "dev-test";
const MAX_AUTH_AGE_SECONDS = 86400;

function safeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(a, "hex"),
    Buffer.from(b, "hex"),
  );
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): UserIdentity | undefined {
  if (!initData || !botToken) {
    return undefined;
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");

  if (!receivedHash) {
    return undefined;
  }

  const authDateRaw = params.get("auth_date");

  if (!authDateRaw) {
    return undefined;
  }

  const authDate = Number(authDateRaw);

  if (
    !Number.isInteger(authDate) ||
    authDate <= 0 ||
    authDate > nowSeconds + 60 ||
    nowSeconds - authDate > MAX_AUTH_AGE_SECONDS
  ) {
    return undefined;
  }

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!safeEqualHex(calculatedHash, receivedHash)) {
    return undefined;
  }

  const userRaw = params.get("user");

  if (!userRaw) {
    return undefined;
  }

  let user: unknown;

  try {
    user = JSON.parse(userRaw);
  } catch {
    return undefined;
  }

  if (
    typeof user !== "object" ||
    user === null ||
    !("id" in user) ||
    typeof user.id !== "number" ||
    !Number.isInteger(user.id)
  ) {
    return undefined;
  }

  return {
    userId: String(user.id),
    source: "telegram",
  };
}

export function getUserIdentityFromHeaders(
  headers: IncomingHttpHeaders,
): UserIdentity | undefined {
  const initData =
    headers["x-telegram-init-data"];

  const initDataValue = Array.isArray(initData)
    ? initData[0]
    : initData;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (initDataValue && botToken) {
    const telegramIdentity = validateTelegramInitData(
      initDataValue,
      botToken,
    );

    if (telegramIdentity) {
      return telegramIdentity;
    }
  }

  const authorization = headers.authorization;

  if (!authorization) {
    return undefined;
  }

  const [scheme, token, ...extra] =
    authorization.split(" ");

  if (
    scheme !== "Bearer" ||
    token !== DEV_TOKEN ||
    extra.length > 0
  ) {
    return undefined;
  }

  return {
    userId: DEV_TOKEN,
    source: "dev",
  };
}
