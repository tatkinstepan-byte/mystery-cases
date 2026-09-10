import { createServer } from "node:http";
import { getCase } from "./data/cases.js";
import { hasEntitlement } from "./data/entitlements.js";
import { getUserIdFromHeaders } from "./auth.js";

type ServerResponse = import("node:http").ServerResponse;

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown
) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(body));
}

const PORT = Number(process.env.PORT ?? 3000);

const server = createServer((req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, {
      error: "Bad request"
    });
  }

  const match = req.url.match(/^\/api\/cases\/([^/?]+)$/);

  if (req.method !== "GET" || !match) {
    return sendJson(res, 404, {
      error: "Not found"
    });
  }

  const caseId = match[1];

  const userId = getUserIdFromHeaders(req.headers);

  if (!userId) {
    return sendJson(res, 401, {
      error: "Unauthorized"
    });
  }

  const caseRecord = getCase(caseId);

  if (!caseRecord) {
    return sendJson(res, 404, {
      error: "Case not found"
    });
  }

  if (
    caseRecord.status !== "unlocked" ||
    !hasEntitlement(userId, caseId)
  ) {
    return sendJson(res, 403, {
      error: "Case locked"
    });
  }

  return sendJson(res, 200, {
    case: {
      id: caseRecord.id,
      title: caseRecord.title
    }
  });
});

server.listen(PORT, () => {
  console.log(`Mystery Cases API running on port ${PORT}`);
});
