export type EvidenceId =
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "E5"
  | "E6"
  | "E7";

export type EvidenceDefinition = {
  id: EvidenceId;
  title: string;
  caseId: string;
};

const evidence: EvidenceDefinition[] = [
  {
    id: "E1",
    title: "Last Message",
    caseId: "last-message",
  },
  {
    id: "E2",
    title: "CCTV Entrance",
    caseId: "last-message",
  },
  {
    id: "E3",
    title: "CCTV Store",
    caseId: "last-message",
  },
  {
    id: "E4",
    title: "Damage Evidence",
    caseId: "last-message",
  },
  {
    id: "E5",
    title: "Sensor Log",
    caseId: "last-message",
  },
  {
    id: "E6",
    title: "Physical Scene",
    caseId: "last-message",
  },
  {
    id: "E7",
    title: "Watches",
    caseId: "last-message",
  },
];

export function getEvidence(
  caseId: string,
  evidenceId: string
): EvidenceDefinition | undefined {
  return evidence.find(
    (item) =>
      item.caseId === caseId &&
      item.id === evidenceId
  );
}
