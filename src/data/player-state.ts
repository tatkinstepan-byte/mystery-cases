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

  const progression: Record<string, string> = {
    E1: "suspect",
    E2: "timeline",
    E3: "mechanism",
    E4: "reconstruction",
    E5: "false_discovery",
    E6: "final_reconstruction",
    E7: "final_reconstruction"
  };

  const stepOrder = [
    "incident",
    "suspect",
    "timeline",
    "mechanism",
    "reconstruction",
    "false_discovery",
    "final_reconstruction"
  ];

  const nextStep = progression[evidenceId];

  if (nextStep) {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const nextIndex = stepOrder.indexOf(nextStep);

    if (nextIndex > currentIndex) {
      state.currentStep = nextStep;
    }
  }

  if (state.receivedEvidence.includes("E7")) {
    state.currentStep = "final_reconstruction";
    state.completed = true;
  }

  return state;
}
