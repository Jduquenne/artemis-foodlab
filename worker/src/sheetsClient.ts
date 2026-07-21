import { getAccessToken } from "./googleAuth";
import { Env } from "./types";

const API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function quoteSheetName(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

async function sheetsFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  const accessToken = await getAccessToken(env);
  const response = await fetch(`${API_BASE}/${env.GOOGLE_SHEET_ID}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Sheets API ${response.status}: ${await response.text()}`);
  }
  return response;
}

export async function readAllRows(env: Env, sheetName: string): Promise<string[][]> {
  const response = await sheetsFetch(
    env,
    `/values/${encodeURIComponent(quoteSheetName(sheetName))}?valueRenderOption=UNFORMATTED_VALUE`,
  );
  const payload = (await response.json()) as { values?: unknown[][] };
  return (payload.values ?? []).map((row) => row.map((cell) => (cell == null ? "" : String(cell))));
}

export async function appendRow(env: Env, sheetName: string, values: unknown[]): Promise<void> {
  await sheetsFetch(
    env,
    `/values/${encodeURIComponent(quoteSheetName(sheetName))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [values] }) },
  );
}

export async function updateRow(env: Env, sheetName: string, rowNumber: number, values: unknown[]): Promise<void> {
  const range = `${quoteSheetName(sheetName)}!A${rowNumber}`;
  await sheetsFetch(env, `/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [values] }),
  });
}

async function getSheetIdByName(env: Env, sheetName: string): Promise<number> {
  const response = await sheetsFetch(env, "?fields=sheets.properties");
  const payload = (await response.json()) as {
    sheets: { properties: { sheetId: number; title: string } }[];
  };
  const match = payload.sheets.find((sheet) => sheet.properties.title === sheetName);
  if (!match) throw new Error(`Onglet introuvable: ${sheetName}`);
  return match.properties.sheetId;
}

export async function deleteRow(env: Env, sheetName: string, rowNumber: number): Promise<void> {
  const sheetId = await getSheetIdByName(env, sheetName);
  await sheetsFetch(env, ":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    }),
  });
}
