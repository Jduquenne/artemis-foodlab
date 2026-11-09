export type BaseVersion = "home" | "industrial";

export interface BaseVersionChoice {
  baseCode: string;
  version: BaseVersion;
}
