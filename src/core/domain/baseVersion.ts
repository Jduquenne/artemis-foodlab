export type BaseVersion = "home" | "industrial" | "frozen";

export type SelectableBaseVersion = Exclude<BaseVersion, "frozen">;

export interface FrozenBaseLink {
  freezerItemId: string;
  quantity: number;
}

export type BaseVersionChoice =
  | { baseCode: string; version: SelectableBaseVersion }
  | ({ baseCode: string; version: "frozen" } & FrozenBaseLink);
