import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  validateTelegramInitData,
  getUserIdentityFromHeaders,
} from "./auth.js";

const BOT_TOKEN = "123456:TEST_TOKEN";
const NOW = 1700001000;
const AUTH_DATE = 1700000000;

const user = JSON.stringify({
  id: 987654321,
  first_name: "Test",
});

const params = new URLSearchParams({
  auth_date: String(AUTH_DATE),
  user,
});

const dataCheckString = [...params.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

const secretKey = createHmac("sha256", "WebAppData")
  .update(BOT_TOKEN)
  .digest();

const hash = createHmac("sha256", secretKey)
  .update(dataCheckString)
  .digest("hex");

const validInitData =
  `${params.toString()}&hash=${hash}`;

const validIdentity = validateTelegramInitData(
  validInitData,
  BOT_TOKEN,
  NOW,
);

assert.deepEqual(validIdentity, {
  userId: "987654321",
  source: "telegram",
});

const invalidIdentity = validateTelegramInitData(
  `${params.toString()}&hash=deadbeef`,
  BOT_TOKEN,
  NOW,
);

assert.equal(invalidIdentity, undefined);

const expiredIdentity = validateTelegramInitData(
  validInitData,
  BOT_TOKEN,
  AUTH_DATE + 86401,
);

assert.equal(expiredIdentity, undefined);

const missingHashIdentity = validateTelegramInitData(
  params.toString(),
  BOT_TOKEN,
  NOW,
);

assert.equal(missingHashIdentity, undefined);

const devIdentity = getUserIdentityFromHeaders({
  authorization: "Bearer dev-test",
});

assert.deepEqual(devIdentity, {
  userId: "dev-test",
  source: "dev",
});

const wrongDevIdentity = getUserIdentityFromHeaders({
  authorization: "Bearer anything-else",
});

assert.equal(wrongDevIdentity, undefined);

const malformedDevIdentity = getUserIdentityFromHeaders({
  authorization: "Bearer dev-test extra",
});

assert.equal(malformedDevIdentity, undefined);

console.log("AUTH TESTS: PASS");
