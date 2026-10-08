# API (as consumed by the front)

Contracts of `meals-planning-api` that the front relies on, captured from the API session and real payloads. The API repo is authoritative; this file is the front's reference. Front-side behaviour lives in `docs/spec-*.md`.

## Working with the API session

A separate Claude Code session owns `meals-planning-api` (sibling repo). Collaboration is a **relay driven by the owner**:

- Write the question as a self-contained, precise, copy-pastable prompt, and **always introduce it explicitly** with a short label such as "Prompt to paste into the API session:" — never post a bare block.
- Do not guess the shape of a complex endpoint (nested resources, polymorphism) without a concrete example; wait for the **real payloads captured in prod or dev**. For simple endpoints following a confirmed pattern, a reasonable assumption + empirical verification is acceptable.
- A decision that affects the other side's data model (unique constraint, opening a route to a role) is raised to the owner as a **product decision**.
- Even a confirmed text contract deserves empirical verification, especially when the endpoint is only local: run the API locally (`npm run dev` in the API repo), create a throwaway account (`NEW_USER_EMAIL=… NEW_USER_PASSWORD=… npx tsx scripts/createUser.ts`), log in with `curl POST /auth/login`, test nominal and documented error cases one by one with `curl`, then clean up (delete the account and data, stop the server). Never repoint the front's `.env` for this.
- A change that **replaces** an existing write path must not be merged until the endpoint it depends on is confirmed deployed in prod.

## General

- Base URL: `VITE_API_URL` (see `docs/development.md`). Bearer access token; JSON.
- Error envelope: `{ "error": { "code", "message" } }`, French messages ready to display. Common codes: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429).
- Deleting an entity still referenced → **409 CONFLICT** (FK `Restrict`).
- CORS: exact origins `https://jduquenne.github.io` and `http://localhost:5173` (origin without the `/artemis-foodlab/` path), `credentials: true`, never `*`.
- Rate limits (prod): writes 300 / 15 min / IP (GET/HEAD/OPTIONS exempt; a batch counts once), import 20 / 15 min, login 10 failures / 15 min, `/media` 1000 / 15 min, `/media/resolve` 240 / 15 min.

## Auth and session

- `POST /auth/login`, `POST /auth/refresh`, `PUT /me/password` return `{ accessToken, refreshToken, user }`; the `refresh_token` cookie (`SameSite=None; Secure; HttpOnly; Path=/auth`) remains as a fallback. `POST /auth/refresh` and `POST /auth/logout` accept `{ refreshToken }` in the body (body wins over cookie). Refresh without cookie nor body → 401. Refresh tokens rotate on every use; replaying a rotated token → 401 "Session compromise" and purge of all the account's sessions (API side, 2026-09-30: a 15 s grace on replay was coded; its deployment was not confirmed at the time).
- Access-token TTL in prod: 30 days (`ACCESS_TOKEN_TTL_MINUTES=43200`); refresh-token TTL 30 days. The role is inside the JWT: a self-demoted admin keeps admin rights until the token expires.
- `AuthUser = { id, email, role: "admin" | "guest", freezerName, displayName: string | null }` — same shape in login / refresh / `GET /me` / `PUT /me` / `PUT /me/password`.
- `GET /me`. `PUT /me { freezerName?, displayName?, email? }` (≥ 1 field; email taken → 409; `{}` → 400).
- `PUT /me/password { currentPassword, newPassword }` → 200 `{ accessToken, user }` (session renewed, reuse the new token); wrong current password → **400** `VALIDATION_ERROR` ("Le mot de passe actuel est incorrect.", on purpose not 401); new password ≥ 12 chars; other sessions are logged out.
- `POST /auth/demo` → 201, same shape as login + `demoExpiresAt` (guest account with `isDemo`, pre-filled, purged after ~2 h). Errors: `DEMO_RATE_LIMIT` (429, 3/h/IP), `DEMO_CAPACITY` (503, 15 active / 50 per 24 h), `DEMO_FORBIDDEN` (403: catalogue writes, upload, `/users`, `/import`, password, e-mail). Refresh is capped at `demoExpiresAt`.

## Bootstrap

`GET /bootstrap` returns the whole boot pack in one response, each key identical to the shape of its standalone endpoint: catalogue (recipes, outdoor activities, foods, household items, recipe categories), household shopping flags (`flaggedAt`), profiles, journal overrides of all profiles, current shopping period. (`journalSettings` is no longer read.) Measured ~150 ms server, ~360 KB gzip.

## Catalogue reads

`GET /recipes` (all at once, no pagination), `GET /recipes/:uuid` (404 if absent or if the uuid is an outdoor activity), `GET /outdoor-activities`, `GET /foods`, `GET /household-items`, `GET /recipe-categories`, `GET /ingredient-categories`.

- Recipes carry `announcedAt` (ISO UTC `…Z` or `null`): set server-side by `POST /recipes`, untouched by `PUT`, `null` for seeded/imported recipes. A `PUT` cannot force it (to be requested if an admin "re-announce" toggle is ever needed).
- `assets.<key> = { url, key }` (`mealPhoto`, `bookPhoto`; `assets = {}` if none).

## Catalogue writes (all `requireAdmin`, otherwise 403)

- **Recipe** — `POST /recipes`, `PUT /recipes/:uuid`, `DELETE /recipes/:uuid`. `code` provided by the client. Body: `{ code, name, categoryId, kind: "dish"|"ingredient"|"base", mealTypes: ("breakfast"|"lunch"|"dinner"|"snack")[], defaultPortions (int > 0), batchCooking?, isDessert?, isFromBook? (default false), bookPage (int > 0 | null), instructions (string | null), ingredients }`. Ingredient: `{ id?, name, categoryId, foodId?, baseId? (uuid of a base recipe), quantity (number | null), unit (string | null), preparation? }`; `foodId` + `baseId` together → 400. Response ingredients gain `id`, `category` (read-only label), `baseId`; `quantity` is always a JSON number.
- **`PUT /recipes/:id` is an upsert by ingredient `id`**: known id → updated in place, absent id → new row, id missing from the array → deleted (its journal overrides cascade), id foreign to the recipe → 400. The builder keeps `ing.id` in `DraftIngredient.apiId` and sends it back; it omits it for new ingredients.
- **Photo** — `POST /recipes/:uuid/photo`, multipart field `photo`, optional text field `kind` (`mealPhoto` default | `bookPhoto`), ≤ 10 MB, `image/*`, converted to webp server-side; non-image → 400, too big → 413. 200 = full recipe.
- **Food** — `POST/PUT/DELETE /foods/:id` (`:id` = short code, e.g. `fv-001`, provided by the client). Body `{ id, name, categoryId, unit (nullable), unitWeight (nullable), isFreezable, macros: { kcal, proteins, lipids, carbohydrates, fibers } }`. `PUT` is partial except `macros` (all or nothing). Response = full `Food` (`categoryId` slug + read-only `category` label); `POST` 201, `PUT` 200; id taken → 409; unknown category → 400. **Rename cascade**: `PUT /foods/:id` propagates the new name to `recipe_ingredients.name` (a copy of the name) in the same transaction; a backfill script with dry-run exists API-side.
- **Outdoor activity** — `POST/PUT/DELETE /outdoor-activities/:uuid`, body `{ code, name, categoryId }` (recipe category, shared), `PUT` partial.
- **Categories** — `POST/PUT/DELETE` on `/recipe-categories` (`{ id, name, color }`), `/ingredient-categories` and `/household-categories` (`{ id, label }`). `id` = stable slug chosen by the client, never changed by `PUT`; taken → 409; referenced → 409.
  - recipe: `bases, cereal-products, charcuterie, dairy-products, dry-food, fish, fruits, outdoor, pastries, plant-proteins, red-meat, sweet-grocery, veggies, white-meat`
  - ingredient: `aromatic-herb, bakery, canned, condiment, dairy, deli, dried-fruit, farm, fish, frozen, fruit-vegetable, internet, meat, non-purchase, recipe, spice, starch, sweet-grocery, unknown` (front: hard-coded `INGREDIENT_CATEGORY_ID` table, `core/domain/ingredientCategorySlugs.ts`)
  - household: `hygiene, maintenance, pantry, pets, pharmacy` (not wired in the front)

## Media

- `url` of an asset = always the `/media/<key>` redirect (stable, `Cache-Control: private, max-age=3600`) → 302 to a signed Supabase URL. **Never store the redirect target.** `GET /media/<key>`: 302, or 404 `NOT_FOUND` for an unknown/invalid key (404 = give up; anything else = retry).
- `POST /media/resolve { keys: string[] }` → 200 `{ urls: Record<key, signedUrl>, expiresAt }`. Unknown key → simply omitted. `keys: []` → 400; key with `../` → 400; > 200 keys → 400; no token → 401. `expiresAt` = one floor for the batch (`now + 6 d`, real signature 7 d).
- Hotlinking from `github.io` is fine. Using direct Supabase URLs in a canvas with `crossorigin` would require configuring the bucket CORS (tell the API); the front does not need it.

## Planning

- `PUT /planning-slots/:year/:week/:day/:slot` upserts a slot; `DELETE /planning-slots/:apiId`. `:day` free string (`monday`), `:slot` ∈ `breakfast|lunch|snack|dinner`.
- `POST /planning-slots/:slotId/items` accepts any plannable `itemId` (recipe or outdoor activity uuid); unknown → 400.
- **Batch** — `PUT /planning-slots/:id/items/batch`, body `{ add?: { itemId, isDessert?, personsOverride?, gramsOverride? }[], remove?: uuid[], update?: { id, isDessert?, personsOverride?, gramsOverride? }[] }`, at least one non-empty array; the same `id` cannot be in both `remove` and `update` (400). `position` on `add` is ignored (append server-side).
  - Response 200 `{ items: [{ id, itemId, isDessert, personsOverride, gramsOverride, position }] }` = **full, up-to-date state of the slot**, sorted by `position`. Rebuild the local cache from this whole array; never correlate by index with the `add` sent.
  - All or nothing: unknown catalogue `itemId` → 400; `id` unknown or outside the slot → 404; empty body → 400; unknown slot → 404. Positions are not renormalised after a `remove` (verified; no front impact).
  - Limit: scoped to one slot — a drag & drop A→B is two non-atomic batch calls.
  - Front: `core/services/planningService.ts` (`saveSlot`) + `core/logic/planning/planningApiMapper.ts` (`buildSlotItemsBatchPayload`, `mapApiItemsToSlotFields`). No automatic fallback to one-by-one calls.
- **Usage stats** — `GET /planning-slots/recipe-usage?slots=lunch,dinner` (`requireAuth`, caller's own planning only) → `{ items: [{ code, plannedCount, firstWeek, lastWeek }] }`. Only `plannedCount > 0`, recipes only; weeks as `"YYYY-Www"` zero-padded; sorted `plannedCount` desc then `code`; no pagination; unknown `slots` value → 400.

## Journal and profiles

- `POST /journal-overrides` **replaces all 3 fields** (`portionsOverride`, `gramsOverride`, `ingredientOverrides`) on every call — an omitted field is erased. Always send the current state of the three. Accepts `profileId` (absent → first profile). Overrides of an ingredient cascade when it disappears from its recipe; overrides of a slot item cascade when it is removed from the planning.
- `GET/POST/PUT/DELETE /profiles`: max 3 per account (409), deleting the last profile → 409. Profile = name (unique per account), color slug, position, 5 targets.
- `/journal-settings` is deprecated (targets go through `PUT /profiles/:id`).

## Shopping and household

- Shopping period: `GET /shopping-periods/current`; changing the shopping days deletes and recreates the period (checks, stocks and extras go with it) in one call, `PUT /shopping-periods/current { "days": [ { year (2000–2100), week (1–53), day (non-empty) } ] }` (live 2026-10-07): one transaction that deletes all the account's periods (same cascade as `DELETE`) and creates the new one; max 50 days, no duplicate `(year, week, day)`; 200 = same shape as `GET /current` (`{ id, createdAt, days }`), `days: []` → 200 `null`; days ordered by year then week only; 400 `VALIDATION_ERROR` leaves everything untouched; no 404; counts once in the write limiter. Under a period: `ShoppingDay[]`, item checks (`isChecked` / `stockOverride` / `freezerBagIds`, one resource for check + stock + bags), source checks (recipe × day × slot), extras.
- **Source checks in batch** (live 2026-10-07) — `PUT /shopping-periods/:periodId/source-checks { "checks": [ { foodId, recipeId (uuid), day, slot, isChecked (required) } ] }`, max 200. Upsert keyed by (period, foodId, recipeId, day, slot): existing checks keep their id, missing ones are created; the same key twice → 400. All or nothing. 200 = the sent checks in request order, same shape as `GET …/source-checks` (`{ id, foodId, recipeId, day, slot, isChecked }`); `checks: []` → 200 `[]`. Errors: 400 `VALIDATION_ERROR` (unknown food or recipe — only the first one named —, duplicate key, missing `isChecked`, > 200), 404 period of another account. One call = one write in the limiter. No deletion through this route; `day` is not checked against the period's days. The front uses only this route for source checks (`upsertSourceChecks`); the single `POST` / `PUT /:id` routes still exist.
- **Extras** — `/shopping-periods/:periodId/extras` (`requireAuth`, period of the user, else 404; cascade with the period). `GET` → `ShoppingExtra[]` sorted `createdAt` asc; `POST` → 201, body `{ name, quantity?, unit?, categoryId?, foodId?, recipeId?, isChecked? }`; `PUT /:id` partial; `DELETE /:id` → 204. `recipeId` = recipe uuid (400 if not a recipe); `categoryId` = ingredient category slug; `foodId` = short id; unknown FK → 400; `unit` free string ≤ 50 chars; no uniqueness; `quantity` is a JSON number; links `onDelete: SetNull`.
  Example: `{ "id": "uuid", "name": "Fromage de chèvre", "quantity": 200, "unit": "g", "categoryId": "dairy", "foodId": null, "recipeId": null, "isChecked": false, "createdAt": "2026-09-09T10:00:00.000Z" }`
- Household: checking an item = "to buy" → `PUT /household-shopping-flags/:id` (check) / `DELETE` (uncheck).

## Freezer

- `FreezerCategory.color: string | null` on `GET/POST/PUT /freezer-categories`: opaque string validated `^[a-z0-9-]{1,20}$`; the list of valid keys is 100 % front; `null` = automatic colour.
- Freezer bag `unit` is required (non-empty) — `Unit.NONE` must not be offered for bags.
- `BatchFreezerItem.recipeName` is returned by the API (current name via join) and no longer sent by the front.
- **Food item with its bags in one call** (live 2026-10-07): `POST /freezer-items` with `type: "food"` accepts an optional `bags` array (max 50), each `{ quantity (> 0, ≤ 9999999.999), unit (non-empty), preparation (non-empty string | null, optional), addedDate ("YYYY-MM-DD") }`, without `foodItemId`; `bags` absent → `[]`; ignored for `type: "batch"`. All or nothing. 201 = full item, `food.bags` sorted by `addedDate` ascending (not the sent order), `addedDate` returned as an ISO datetime. Counts once in the write limiter. `addItemToCategory` builds the cache from this response (`mapApiItem`). Adding bags to an existing item stays one `POST /freezer-bags` per bag.
  ```
  POST /freezer-items { "type": "food", "categoryId": "<uuid>", "foodId": "fv-010", "name": "Betterave rouge",
    "bags": [ { "quantity": 500, "unit": "g", "preparation": "écossés", "addedDate": "2026-10-01" } ] }
  → 201 { "id": "<uuid>", "type": "food", "position": 0, "food": { "foodId": "fv-010", "name": "Betterave rouge",
    "bags": [ { "id": "<uuid>", "quantity": 500, "unit": "g", "preparation": "écossés", "addedDate": "2026-10-01T00:00:00.000Z" } ] } }
  ```
- Blocked deletes return French 409 messages.

## Import

`POST /import` (`requireAuth`, guest OK) with the raw **`SyncPayload` v3**. Read fields: `version: 3` (required), `planning[]`, `household[]`, `freezerCategories[]`, `freezerName`; `shoppingDays/Checked/Stocks` accepted but ignored.

- **Replacement by scope**: each scope present is purged then reinserted; absent scope untouched; idempotent. UI must say "replaces your data". Replacing the planning cascades onto journal portion adjustments (warn the user).
- Overwrite guard: account already has data in a scope of the payload → **409** with a ready message listing the scopes; resend the same payload with `"overwrite": true`. `freezerName` alone never triggers 409.
- 200 `{ summary: { planning?: { slots, items }, household?: { flags }, freezer?: { categories, items } }, anomalies: string[] }`; line-level tolerance (unknown codes listed in `anomalies`). Not a v3 payload → 400; body > 2 MB → 413; server transaction all or nothing; dedicated rate limit (429).
- Front: `core/services/importService.ts` (`importToApi(payload, scopes, overwrite?)`), `features/sync/ImportModal.tsx`, `suppressGlobalError: true`.

## Users (admin)

All `requireAuth + requireAdmin` (guest → 403, no token → 401).

- `GET /users` → array sorted by email: `{ id, email, role, freezerName, displayName, createdAt, updatedAt }`. No `hasPassword` / `hasGoogle` / `lastLoginAt`.
- `POST /users { email, password (≥ 12), role (required), freezerName? (default "Mon Congélateur"), displayName? }` → 201; email taken → 409.
- `PUT /users/:id` partial (`email?`, `password?` = admin reset, `role?`, `freezerName?`, `displayName?`); removing admin from the last admin → 409; unknown → 404.
- `DELETE /users/:id` → 204; last admin → 409. **Cascade = all user data** (sessions, planning + items + journal overrides, journal settings, household flags, freezer, shopping periods); catalogue untouched.

## Planned (not live — do not code against it)

- **Google sign-in** (`dev/issues.json` #10): `POST /auth/google { credential }` (Google Identity Services ID token), response identical to login; 401 if the token is invalid or the e-mail unverified; 429 rate limit. New accounts are `guest`. Requires the owner's Google Cloud setup (OAuth client "Web application", origins `http://localhost:5173` and `https://jduquenne.github.io`, no redirect URI) and the same client id in `VITE_GOOGLE_CLIENT_ID` (front) and `GOOGLE_CLIENT_ID` (API). Wait for the API session to confirm it is live and send real payloads.
- Optional `id` (foods) and `code` (outdoor) generated server-side: proposed by the API, not merged; the client still provides them.
- **Outdoor activity photo** (contract confirmed by the API session on 2026-10-08 with real payloads, **not deployed yet**; front coded in v6.82.0, to push only after the owner confirms the API is live — breaking change: the current prod front can no longer create an activity once the API is deployed). Photo mandatory server-side (owner's decision). `POST /outdoor-activities` becomes `multipart/form-data` (admin): text fields `code`, `name`, `categoryId` + file `photo` (`image/*`, ≤ 10 MB, required); JSON body or missing photo → 400, nothing created; check order: fields (400) → file present and image (400) → code taken (409) → category exists (400) → image readable (400); 201 = `{ id, code, name, categoryId, assets: { mealPhoto: { url, key } } }`, key `outdoor-activities/<uuid>/mealPhoto.webp`. `POST /outdoor-activities/:uuid/photo` replaces the photo (multipart `photo` required, `kind` optional, only `"mealPhoto"`), same key overwritten, 200 = same shape; errors: 404 `NOT_FOUND` « Cette activité extérieure est introuvable. », 400 `VALIDATION_ERROR` « Aucun fichier reçu dans le champ "photo". » / « Le fichier envoyé n'est pas une image. » / wrong `kind`, 413 `PAYLOAD_TOO_LARGE`. `PUT /outdoor-activities/:uuid` stays JSON and never touches the photo; no route removes a photo. `GET /outdoor-activities`, `GET /:uuid`, `/bootstrap` expose `assets.mealPhoto`; `/media/resolve` resolves `outdoor-activities/…` keys. `POST /recipes/:uuid/photo` rejects activity uuids (404) and now checks existence before uploading. Still unanswered by the API session: number of existing activities without `meal_photo_path`, and what `POST /import` does with activities.


