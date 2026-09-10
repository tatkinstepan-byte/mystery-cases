import { createServer } from "node:http";
import { getCase } from "./data/cases.js";
import { hasEntitlement } from "./data/entitlements.js";
import { getUserIdentityFromHeaders } from "./auth.js";
import { getEvidence } from "./data/evidence.js";
import { getOrCreatePlayerCaseState, receiveEvidence, completeFalseDiscovery, completeFinalReconstruction } from "./data/player-state.js";
import { validateFinalReconstruction } from "./data/final-reconstruction.js";

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

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, {
      error: "Bad request"
    });
  }

  const receiveEvidenceMatch = req.url.match(
    /^\/api\/cases\/([^/?]+)\/evidence\/([^/?]+)\/receive$/
  );

  const falseDiscoveryMatch = req.url.match(
    /^\/api\/cases\/([^/?]+)\/false-discovery$/
  );

  const finalReconstructionMatch = req.url.match(
    /^\/api\/cases\/([^/?]+)\/final-reconstruction$/
  );

  const stateMatch = req.url.match(
    /^\/api\/cases\/([^/?]+)\/state$/
  );

  const evidenceMatch = req.url.match(
    /^\/api\/cases\/([^/?]+)\/evidence\/([^/?]+)$/
  );

  const caseMatch = req.url.match(
    /^\/api\/cases\/([^/?]+)$/
  );

  if (
    finalReconstructionMatch &&
    req.method === "POST"
  ) {
    const caseId = finalReconstructionMatch[1];

    const identity = getUserIdentityFromHeaders(req.headers);

    if (!identity) {
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
      !hasEntitlement(identity.userId, caseId)
    ) {
      return sendJson(res, 403, {
        error: "Case locked"
      });
    }

    const state = getOrCreatePlayerCaseState(
      identity.userId,
      caseId
    );

    if (
      !state.falseDiscoveryCompleted ||
      !state.finalReconstructionAvailable
    ) {
      return sendJson(res, 409, {
        error: "Final Reconstruction unavailable"
      });
    }

    let body = "";

    try {
      for await (const chunk of req) {
        body += chunk.toString();
      }
    } catch {
      return sendJson(res, 400, {
        error: "Invalid request body"
      });
    }

    let input: unknown;

    try {
      input = JSON.parse(body);
    } catch {
      return sendJson(res, 400, {
        error: "Invalid JSON"
      });
    }

    if (!validateFinalReconstruction(input)) {
      return sendJson(res, 200, {
        result: "incorrect",
        state
      });
    }

    const updatedState = completeFinalReconstruction(
      identity.userId,
      caseId
    );

    if (!updatedState) {
      return sendJson(res, 409, {
        error: "Final Reconstruction unavailable"
      });
    }

    return sendJson(res, 200, {
      result: "correct",
      state: updatedState
    });
  }

  if (
    falseDiscoveryMatch &&
    req.method === "POST"
  ) {
    const caseId = falseDiscoveryMatch[1];

    const identity = getUserIdentityFromHeaders(req.headers);

    if (!identity) {
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
      !hasEntitlement(identity.userId, caseId)
    ) {
      return sendJson(res, 403, {
        error: "Case locked"
      });
    }

    const state = getOrCreatePlayerCaseState(
      identity.userId,
      caseId
    );

    if (
      !state.receivedEvidence.includes("E5") ||
      state.currentStep !== "false_discovery"
    ) {
      return sendJson(res, 409, {
        error: "False Discovery unavailable"
      });
    }

    const updatedState = completeFalseDiscovery(
      identity.userId,
      caseId
    );

    if (!updatedState) {
      return sendJson(res, 409, {
        error: "False Discovery unavailable"
      });
    }

    return sendJson(res, 200, {
      result: "false_discovery_resolved",
      state: updatedState
    });
  }

  if (
    receiveEvidenceMatch &&
    req.method === "POST"
  ) {
    const caseId = receiveEvidenceMatch[1];
    const evidenceId = receiveEvidenceMatch[2];

    const identity = getUserIdentityFromHeaders(req.headers);

    if (!identity) {
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
      !hasEntitlement(identity.userId, caseId)
    ) {
      return sendJson(res, 403, {
        error: "Case locked"
      });
    }

    const evidence = getEvidence(caseId, evidenceId);

    if (!evidence) {
      return sendJson(res, 404, {
        error: "Evidence not found"
      });
    }

    const state = receiveEvidence(
      identity.userId,
      caseId,
      evidenceId
    );

    return sendJson(res, 200, {
      state
    });
  }

  if (req.method !== "GET") {
    return sendJson(res, 404, {
      error: "Not found"
    });
  }

  const identity = getUserIdentityFromHeaders(req.headers);

  if (!identity) {
    return sendJson(res, 401, {
      error: "Unauthorized"
    });
  }

  const caseId =
    stateMatch?.[1] ??
    evidenceMatch?.[1] ??
    caseMatch?.[1];

  if (!caseId) {
    return sendJson(res, 404, {
      error: "Not found"
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
    !hasEntitlement(identity.userId, caseId)
  ) {
    return sendJson(res, 403, {
      error: "Case locked"
    });
  }

  if (stateMatch) {
    const state = getOrCreatePlayerCaseState(
      identity.userId,
      caseId
    );

    return sendJson(res, 200, {
      state
    });
  }

  if (evidenceMatch) {
    const evidenceId = evidenceMatch[2];
    const evidence = getEvidence(caseId, evidenceId);

    if (!evidence || evidence.caseId !== caseId) {
      return sendJson(res, 404, {
        error: "Evidence not found"
      });
    }

    return sendJson(res, 200, {
      evidence
    });
  }

  if (caseMatch) {
    return sendJson(res, 200, {
      case: {
        id: caseRecord.id,
        title: caseRecord.title
      }
    });
  }

  return sendJson(res, 404, {
    error: "Not found"
  });
});

server.listen(PORT, () => {
  console.log(`Mystery Cases API running on port ${PORT}`);
});
