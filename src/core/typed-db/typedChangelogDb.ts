import raw from "../data/changelog.json";
import { ChangelogEntry } from "../domain/types";

export const typedChangelogDb = raw as unknown as ChangelogEntry[];
