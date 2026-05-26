import instructionsDbRaw from "../data/instructions-db.json";

interface InstructionEntry {
  id: string;
  instructions: string;
}

export const typedInstructionsDb = instructionsDbRaw as unknown as Record<string, InstructionEntry>;
