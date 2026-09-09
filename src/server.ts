import http from "node:http";
import { getCase } from "./data/cases.js";

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad request" }));
    return;
  }

  const match = req.url.match(/^\/api\/cases\/([^/]+)$/);

  if (req.method === "GET" && match) {
    const caseId = decodeURIComponent(match[1]);

    if (!req.headers.authorization) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    const caseData = getCase(caseId);

    if (!caseData) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Case not found" }));
      return;
    }

    if (caseData.status === "locked") {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Case locked" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(caseData));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
