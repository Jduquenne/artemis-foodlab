import { EMPTY_JOURNAL_OVERRIDES } from "../../core/logic/journal/journalOverrideLogic";
import { JournalOverrides } from "../../core/domain/journal";
import { useJournalStore } from "../store/useJournalStore";
import { useProfileStore } from "../store/useProfileStore";

export function useActiveJournalOverrides(): JournalOverrides {
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const overridesByProfile = useJournalStore((s) => s.overridesByProfile);
  return (activeProfileId && overridesByProfile[activeProfileId]) || EMPTY_JOURNAL_OVERRIDES;
}
