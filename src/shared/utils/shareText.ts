import { IS_TOUCH } from "./deviceUtils";

export type ShareOutcome = "shared" | "cancelled" | "failed";

export const CAN_SHARE_TEXT = IS_TOUCH && typeof navigator !== "undefined" && typeof navigator.share === "function";

export async function shareText(title: string, text: string): Promise<ShareOutcome> {
  try {
    await navigator.share({ title, text });
    return "shared";
  } catch (error) {
    return error instanceof DOMException && error.name === "AbortError" ? "cancelled" : "failed";
  }
}
