# Spec — Accounts, session, profiles and demo mode

One account = one household. Login required. Roles: `admin` / `guest` (`docs/architecture.md` § Auth and roles).

## Session

- Boot: `useAuthInit` → `silentRefresh()` → rebuilds the UI from `user`; 401 → `unauthenticated` → `LoginScreen`. During a slow start, `useDelayedFlag` shows "Réveil du serveur…" after 5 s.
- Access token in memory. Refresh token stored in `localStorage` (`core/services/refreshTokenStore.ts`, key `cipe_refresh_token`) and sent in the body — the cross-site cookie was refused by Safari ITP / hardened Chrome, which logged users out on every reload (D-007).
- `apiClient.performTokenRefresh()` is the **single mutex** for refresh (the 401-retry of `apiFetch` and `authService.silentRefresh` both use it, so no concurrent rotation burns a token; StrictMode's double invocation used to cause "session compromise"). It stores the rotated token after each response.
- On refresh failure, the stored token is cleared **only on 400/401/403** (`isRefreshRejected`, `core/logic/auth/refreshOutcomeLogic.ts`); network errors and 502/503 (Render waking up) are retried with `REFRESH_RETRY_DELAYS_MS`. (Clearing on any failure caused logouts after ~15 min of inactivity.)
- `authService`: `login` / `changePassword` adopt the session (`adoptSession`); `logout` sends `{ refreshToken }` then clears storage and access token.
- Known limits: multi-tab concurrent refresh not covered; rare race between `changePassword` and an in-flight refresh (backstop = API replay detection).

## Account screen — `AccountModal`

Lazy, opened from `SettingsPopover` → « Compte»:

- Profile: e-mail + display name (`displayName`, display only: greeting and name column in the admin users list; no business logic). Saved via `updateMe` with `suppressGlobalError` → inline error. E-mail change allowed directly, 409 if taken, no re-verification.
- Password: current / new / confirmation, ≥ 12 chars, `changePassword` → inline error; the new access token is reused.
- If admin: « Gérer les comptes » link → `/dashboard`.
- « Se déconnecter »: `logout()` then `setUser(null)` + `setStatus("unauthenticated")`.
- No password reset by e-mail (the API sends no e-mails). Locked-out account recovery = another admin resets it from the dashboard ("2 admins" rule); fallback = server script (owner). Decision D-025.
- `FreezerHeader` edits `freezerName` via `updateMe({ freezerName })`.

## Profiles — people of a household

A **profile** = one person (no credentials), max **3** per account (`MAX_PROFILES`, `core/domain/profileConfig.ts`, also enforced by the API: 409). Each profile carries its name, colour, kcal/macro targets and **its own journal overrides**; planning, shopping, household and freezer stay shared. V1 = Journal only. Decision D-012.

- `useProfileStore` (`shared/store/`): `profiles` + `activeProfileId` (only the latter is persisted, `localStorage`, per device — e.g. a shared tablet switches in one tap). `replaceProfiles` (boot) resolves a valid active id, otherwise the first one. Writes go through the API first (`profileService`), no optimistic update.
- `useJournalStore.overridesByProfile`: `Record<profileId, JournalOverrides>`. Components read the active profile via `useActiveJournalOverrides`; targets via `useActiveProfile` / `useActiveTargets` (fallback `DEFAULT_PROFILE_TARGETS` before boot). `persistOverride` captures the `profileId` when it starts (a profile switch in flight mixes nothing) and sends it in `POST /journal-overrides`.
- Targets are edited via `updateProfile` (no more `/journal-settings`). `/bootstrap` provides `profiles` + journal overrides of all profiles.
- UI: `ProfileSwitcher` (Journal, `MacroSummary` header) + `ProfilesModal` (`shared/components/ui/profiles/`, also in `SettingsPopover`). Colours: API slug → inline hex (`PROFILE_COLORS`), never a runtime Tailwind class. `MacroTargetsModal` / `WeekAverageModal` follow the active profile.
- **Préférences** (D-033, accompaniments since v6.127.0 — D-037 step 2): the panel was « Préférences par famille »; it now lists first the household's **accompaniments** (`AccompanimentDefaultSelect`, one select per accompaniment for the selected profile: « Par défaut (<accompaniment default>) » = no profile default (`DELETE`), « Sans accompagnement » = explicit none (`optionId: null`), or an option; pending key `profile-accompaniment-default:<profileId>:<accompanimentId>`; filtered by the same search, `filterAccompaniments`), then the families as below; the entry row counts both (« N préférences · M accompagnements · K familles ») and shows as soon as an accompaniment or a family exists. Families: at the bottom of `ProfilesModal`, a single entry row `FoodGroupDefaultsSection` (« N préférences · M familles », nothing shown when no family has a food) opens a dedicated panel `FoodGroupDefaultsPanel` that replaces the modal content (fixed `90dvh` height, back « ‹ » to the profiles; v6.122.0, owner 2026-10-21: the inline list of every family × every profile became a very long scroll). The panel shows **one profile at a time** (profile tabs when there are several, the active profile first selected), a search on the family name or one of its foods (`foldText`: accents and case ignored), then the families of `foodGroupsWithFoods` in two lists (`FoodGroupDefaultsList`): « Définies » first, then « Autres familles » (`foodGroupDefaultSections` in `core/logic/foodGroup/foodGroupDefaultsLogic.ts`). The split is frozen when the panel opens or the profile changes, so a row does not jump while being edited. One `FoodGroupDefaultSelect` per family: « Défaut de la recette » (no default) or a food of the family, highlighted when set. Saved on change via `useProfileStore.setFoodGroupDefault` (`PUT /profiles/:id/food-group-defaults/:groupId`, or `DELETE` to go back to the recipe default), `withPending` key `profile-food-group-default:<profileId>:<groupId>`. Generic: a new family created in the Dashboard appears without code change. Allowed in demo and for guests.
- Naming: see `docs/glossary.md` (`displayName` vs profiles).

## Demo mode — ephemeral guest account

No public registration (decision 2026-10-05, D-013). « Essayer la démo » on `LoginScreen` → `POST /auth/demo` (`startDemo` in `authService`): a `guest` account with `isDemo`, pre-filled server-side, purged after expiry (~2 h). API guard rails and error codes: `docs/api.md` § Auth and session.

- `useIsDemo`; `DemoBanner` (in `Layout`, countdown via `useDemoCountdown` + `core/logic/auth/demoLogic.ts`, local logout at expiry). Refresh is capped at `demoExpiresAt` (resuming on reload works, extending is impossible).
- Hidden in demo: import (`SettingsPopover`), e-mail + password (`AccountModal`). Demo accounts are excluded from `UsersPanel` (`excludeDemoAccounts`).
- **Any new action forbidden in demo on the API side must also be hidden in the front via `useIsDemo`.**

## Google sign-in (planned, blocked)

Product decisions (D-029, proposed): open registration via Google, new accounts are `guest`, promotion to admin only from the dashboard; password and Google coexist; automatic linking when the verified Google e-mail matches an existing account; the API will expose `hasPassword` / `hasGoogle` for the account screen. Contract and setup: `docs/api.md` § Planned. Front work possible before the endpoint is live: load the GIS script (`https://accounts.google.com/gsi/client`) and render the button / One-Tap, without wiring the network call.
