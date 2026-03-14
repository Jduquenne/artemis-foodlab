import outdoorDb from "../data/outdoor-db.json";

export interface OutdoorEntry {
  id: string;
  name: string;
  assets?: { photo?: { url: string } };
}

export const typedOutdoorDb = outdoorDb as unknown as Record<string, OutdoorEntry>;
