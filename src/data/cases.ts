export type CaseStatus = "locked" | "unlocked";

export type CaseDefinition = {
  id: string;
  title: string;
  status: CaseStatus;
};

const cases: Record<string, CaseDefinition> = {
  "last-message": {
    id: "last-message",
    title: "Последнее сообщение",
    status: "unlocked",
  },
  "locked-test": {
    id: "locked-test",
    title: "Locked Test Case",
    status: "locked",
  },
};

export function getCase(caseId: string): CaseDefinition | undefined {
  return cases[caseId];
}
