# Conventions

Coding rules for this repo. The verifiable subset is summarised in `AGENTS.md` § Golden rules. UI/styling rules are in `docs/ui-design.md`; placement rules in `docs/architecture.md` § Layers.

## Style

- **Zero comments in the code** (only exception: `src/vite-env.d.ts`). Names must carry the intent.
- UI text in French; code, identifiers and enums in English.

## TypeScript

- `any` forbidden everywhere.
- `as unknown as X` forbidden everywhere.
- Enums in English.
- Props interfaces named `<ComponentName>Props`.
- Prefer validation guards over casts on API strings (`parseUnit` / `isUnit` in `core/logic/unit/unitLogic.ts` instead of `as Unit`).

## Files

- One component per file.
- If a `useMemo` or handler body exceeds ~5 lines of non-trivial logic, extract it as a named pure function in `core/logic/<feature>/`. A JSX block over ~15 lines goes in its own component file.
- `react-refresh`: no mixed exports (a component and a non-component constant in the same file).

## React

- All routes use `React.lazy` — no static page import.
- **No synchronous `setState` in `useEffect`** — the lint (`react-hooks/set-state-in-effect`) rejects it. To reset state when a prop/param changes, reset during render: `const [last, setLast] = useState(id); if (id !== last) { setLast(id); setX(initial); }`, plus a lazy `useState(() => pure(...))` for the initial value (example: `RecipeDetail`, portions). A `key` only remounts a component when set by the **parent** on `<Component key=… />`; a React Router `:param` change does not remount. An effect that only focuses or mutates a ref is fine.
- `exhaustive-deps` respected — never suppress it.
- `eslint-disable` forbidden.
- Hooks cannot be called in `.map()`: a list row that needs a hook is its own component.
- Zustand + synchronous storage: never reference the store inside its own `onRehydrateStorage` callback (hydration runs during `create()` → TDZ `ReferenceError`, silently swallowed).

## Domain predicates

Recipe, slot and freezer predicates are the single source of truth for any business condition. They live in `core/domain/` (`recipePredicates.ts`, `freezerPredicates.ts`), are reused everywhere and never rewritten inline.

## Reuse before writing

Shared utilities (`shared/utils/`) — reuse, do not rewrite:
`sortUtils` (`compareText`, `compareByName`, French collation), `numberUtils` (`toNumber`, `roundTo`, `padNumber`, `parseDecimal`), `collectionUtils` (`sumBy`, `countBy`, `groupBy`, `toggleInList`, `omitKey`), `textUtils` (`normalizeQuery`, `includesText`, `includesAnyText`, `rankByQuery`), `codeUtils` (`highestSequence`, `nextSequentialCode`, `validateNewCode`), `unitUtils` (`formatQty`, `pluralizeUnit`), `assetUrl` (`buildAssetUrl`, `LOGO_URL`, always `BASE_URL`, never a hard-coded `/artemis-foodlab/`).
Macro labels: `core/domain/nutrition.ts` (`NUTRIENT_DEFINITIONS`, `MACRO_DISPLAYS`); recipe labels: `core/domain/recipeLabels.ts`; units: `SELECTABLE_UNITS`, `UNIT_WEIGHT_UNITS` (`core/domain/ingredient.ts`); slot id: `buildSlotId` (`core/logic/planning/planningSlotIdLogic.ts`). Scroll restoration: `useScrollRestore(key)` with a key that includes everything that changes the content.

## Abstractions

Create a shared helper only when a real pattern repeats (~5 occurrences or more, counted with grep). Do not wrap a language construct (e.g. `try/catch` → keep `try { … } catch { return; }` or `.catch(() => undefined)` inline), and do not create a file for two trivial functions. Always propose the location and wait for the owner's agreement.

## Forms and numeric input

Every numeric field uses `DecimalInput` (`shared/components/ui/`, `type="text"` + `inputMode`, local text state, `onValueChange(number | null)`, `integer` prop) and `parseDecimal` (accepts `,` and `.`, returns `null` if invalid). Never `type="number"` + `Number()` on a controlled field (it prevented clearing a field and broke `1,5`). Profile macro targets, persons, portions, book page and recipe number are integers.

## Error handling

- `apiClient` (`core/services/apiClient.ts`) is the single network entry point (`apiFetch` / `apiFetchJson`). On `!res.ok` it calls `onApiError` → global red notification (`useAuthInit`). API errors use the envelope `{ error: { code, message } }` with French messages ready to display.
- A component only catches locally to drive its own form state, never to re-display the message.
- Opt-out of the global handler: `apiFetch(path, { suppressGlobalError: true })` (used by import, account forms, media resolve, silent refresh).

## Loading feedback (pending state)

Any mutation triggered by a click (except a form with its own local `submitting` state) must give instant visual feedback — there is no optimistic write, so an explicit "pending" state is the only possible signal.

- `shared/store/usePendingStore.ts` — global `Set<string>` of keys in flight.
- `shared/hooks/usePendingKey.ts` / `useAnyPendingKey.ts` — read one key, or the logical OR of several.
- `shared/utils/withPending.ts` — `withPending(key, () => apiCall())` marks the key during the call and silently ignores a second call with the same key until the first resolves (double-click guard). Returns `undefined` in that case — always check the return value.
- `shared/components/ui/CheckToggleIcon.tsx` — replaces a `CheckCircle2`/`Circle` pair with an animated `Loader2` when `pending`.
- Key at the level of the **business action**, not the HTTP request: an action that fires several calls (e.g. check all ingredients of a recipe) uses one key per affected element, never one per request — otherwise the spinner flickers. (Why not in `apiClient`: `docs/decisions.md` D-008.)
- **Pitfall**: never wrap a free-text `onChange` with `withPending` — the guard can drop the last keystroke if it lands while a previous request is in flight, and nothing resends it. Reserved for discrete interactions (click, blur, explicit confirmation). Example: the grams field of `RecipePortionRow` deliberately has none.
- List rows needing these hooks are their own components (`IngredientCheckRow`, `HouseholdCheckRow`, `FreezerBagRow`, `SourceGroupRow`, `RecipeBaseGroupSection`).
- Wired on: shopping, household, journal (portion stepper), freezer, planning (delete, persons/grams, copy, pickers, dessert choice on drag & drop). Dashboard / Account / Import / Recipe Builder keep their own local `submitting` state in their modals — do not migrate them without reason.

## Refactoring safety and verification habits

- Before removing or renaming an export, grep **all** of `src/` for its consumers (e.g. `grep -rn "name" src --include="*.ts" --include="*.tsx"`); do not rely on `tsc` alone.
- Before proposing a new file or helper, check it does not already exist (see § Reuse).
- When refactoring delicate logic, prove equivalence (e.g. run old vs new on thousands of random cases).
- When a feature changes state that persists after the action, test the **round trip**, not only the single move (a dessert swap bug was only visible on the way back).
- Verify structural assumptions (id formats, mapping tables) against real code or data before coding, rather than relying on a description from memory.

## Commits

- Format: `feature: <description>` or `fix: <description>` (also `refactor:`, `chore:`, `docs:`). English, short, no bullet points, no technical details. (`feature:` is kept on purpose, not `feat:`.)
- Footer: `Co-Authored-By` attribution line (and session line when provided by the harness).
- One logical step = one commit; one issue = one commit. The owner commits; agents only propose the message.

## Versioning

`package.json` `version` (+ `public/version.json` mirror) is the single source of truth. Bump it before proposing each commit: **patch** for `fix` / `refactor` / `chore` / `docs`, **minor** for `feature`.
