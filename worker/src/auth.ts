import { Env } from "./types";

export function isAuthorizedAdmin(request: Request, env: Env): boolean {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 && token === env.ADMIN_TOKEN;
}
