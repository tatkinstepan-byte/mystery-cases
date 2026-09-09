import { createServer } from "node:http";

type CaseRecord = {
  id: string;
  title: string;
  status: "locked" | "unlocked";
};

const cases = new Map<string, CaseRecord>([
  [
    "last-message",
    {
      id: "last-message",
      title: "Последнее сообщение",
      status: "unlocked"
    }
  ],
  [
    "locked-test",
    {
      id: "locked-test",
      title: "Locked Test Case",
      status: "locked"
    }
  ]
]);

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  body: unknown
) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, { error: "Bad request" });
  }

  const match = req.url.match(/^\/api\/cases\/([^/?]+)$/);

  if (req.method !== "GET" || !match) {
    return sendJson(res, 404, { error: "Not found" });
  }

  const caseId = match[1];
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendJson(res, 401, {
      error: "Unauthorized"
    });
  }

  const caseRecord = cases.get(caseId);

  if (!caseRecord) {
    return sendJson(res, 404, {
      error: "Case not found"
    });
  }

  if (caseRecord.status !== "unlocked") {
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

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`Mystery Cases API running on port ${PORT}`);
});
