export type PlayerCaseState = {
  unlocked: boolean;
  receivedEvidence: string[];
  currentStep: string;
  completed: boolean;
};

const states = new Map<string, PlayerCaseState>();

function makeKey(userId: string, caseId: string): string {
  return `${userId}:${caseId}`;
}

export function getOrCreatePlayerCaseState(
  userId: string,
  caseId: string
): PlayerCaseState {
  const key = makeKey(userId, caseId);

  const existing = states.get(key);

  if (existing) {
    return existing;
  }

  const initialState: PlayerCaseState = {
    unlocked: true,
    receivedEvidence: [],
    currentStep: "incident",
    completed: false
  };

  states.set(key, initialState);

  return initialState;
}


export function receiveEvidence(
  userId: string,
  caseId: string,
  evidenceId: string
): PlayerCaseState {
  const state = getOrCreatePlayerCaseState(userId, caseId);

  if (!state.receivedEvidence.includes(evidenceId)) {
    state.receivedEvidence.push(evidenceId);
  }

  return state;
}
