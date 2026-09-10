export type FinalReconstructionInput = {
  event_type: string;
  event_time: string;
  discovery_time: string;
  message_time: string;
  event_cause: string;
  object_outcome: string;
  initial_hypothesis: string;
};

const AUTHORITATIVE_SOLUTION: FinalReconstructionInput = {
  event_type: "DISPLAY_CASE_COLLAPSE",
  event_time: "21:17",
  discovery_time: "21:23",
  message_time: "21:12",
  event_cause: "WEAR_DAMAGED_MOUNT",
  object_outcome: "WATCHES_FELL_UNDER_SHELF",
  initial_hypothesis: "ROBBERY"
};

function timeToMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function validateFinalReconstruction(
  input: unknown
): input is FinalReconstructionInput {
  if (!input || typeof input !== "object") {
    return false;
  }

  const candidate = input as Record<string, unknown>;

  for (const key of Object.keys(AUTHORITATIVE_SOLUTION)) {
    if (typeof candidate[key] !== "string") {
      return false;
    }
  }

  if (
    candidate.event_type !== AUTHORITATIVE_SOLUTION.event_type ||
    candidate.event_time !== AUTHORITATIVE_SOLUTION.event_time ||
    candidate.discovery_time !== AUTHORITATIVE_SOLUTION.discovery_time ||
    candidate.message_time !== AUTHORITATIVE_SOLUTION.message_time ||
    candidate.event_cause !== AUTHORITATIVE_SOLUTION.event_cause ||
    candidate.object_outcome !== AUTHORITATIVE_SOLUTION.object_outcome ||
    candidate.initial_hypothesis !== AUTHORITATIVE_SOLUTION.initial_hypothesis
  ) {
    return false;
  }

  const messageTime = timeToMinutes(candidate.message_time);
  const eventTime = timeToMinutes(candidate.event_time);
  const discoveryTime = timeToMinutes(candidate.discovery_time);

  if (
    messageTime === null ||
    eventTime === null ||
    discoveryTime === null
  ) {
    return false;
  }

  return messageTime < eventTime && eventTime < discoveryTime;
}
