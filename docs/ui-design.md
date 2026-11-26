# UI design

Layout, theming and responsive rules. UI text is always in French.

## Layout

- Responsive is mandatory, through Tailwind prefixes.
- **No-scroll layout**: everything fits in the viewport on desktop (`md:` and above). Scrolling is tolerated on mobile.
- No-scroll pattern: `h-full flex flex-col overflow-hidden` + one `flex-1 min-h-0 overflow-y-auto` zone.
- Never a horizontal scroll. Grid columns holding truncated text use `minmax(0, 1fr)`, never plain `1fr` (a `1fr` track never gets narrower than its widest one-line text, so a long name pushed the shopping rows off a phone screen, v6.159.1); a `truncate` text inside a flex row needs `min-w-0`.

## Styling

- Tailwind by default. Custom CSS is allowed for what Tailwind does not cover (`src/index.css`).
- **Runtime Tailwind classes are not generated** by Tailwind v4 (e.g. a class name coming from API data). Use literal classes in the source, or inline hex (`getCardColors(categoryId).band`, `PROFILE_COLORS`).

## Theming

- **CSS variables only** for `slate-*` and `white` colours. Never `dark:text-slate-*` nor `dark:bg-slate-*` (nor `dark:hover:bg-slate-*`): these values are handled by variables, dark mode is automatic.
- `white` stays light in dark mode, so backgrounds use the **named theme colours** (D-031, `src/index.css`), never a `bg-white dark:bg-slate-100`-style pair:

  | Class | Light | Dark | Use |
  |---|---|---|---|
  | `bg-surface` | `white` | `slate-100` | cards, modals, inputs |
  | `bg-surface-raised` | `white` | `slate-200` | buttons / bars laid on a card, small floating modals |
  | `bg-muted` | `slate-100` | `slate-200` | chips, secondary buttons, tab bars, hover |
  | `bg-subtle` | `slate-50` | `slate-200` | light hover |
  | `bg-subtle-tint` | `slate-50` | `slate-200` at 40 % | checked list rows, row hover |
  | `bg-strong` | `slate-200` | `slate-300` | bar tracks, marked separators, hover on a raised surface |

  They take Tailwind modifiers and work for any colour utility (`hover:bg-muted`, `bg-surface/90`, `border-muted`). Do not add a colour for a single use: map it to the nearest one or ask the owner.
- `dark:text-orange-*` and other semantic non-slate colours: `dark:` is legitimate, use it normally.
- Dark mode is class-based via `ThemeProvider` (`shared/contexts/ThemeContext.tsx`; context and `Theme` type in `themeContextValue.ts`, stored value validated by `readStoredTheme`). Never use `prefers-color-scheme` directly. The manifest `theme-color` follows the app theme (`shared/utils/themeColor.ts`).
- Overlays: `bg-black/X`, never `bg-slate-900/X`. Overlays and animations follow the theme tokens.

## Animations

Never animate `width` / `height`; use `transform` (e.g. `scaleX` progress bars).

## Tablet portrait

Target: iPad Air 820×1180 (DPR 2), used in portrait.

- Custom Tailwind variant `tablet:` defined in `src/index.css` (`@custom-variant`): width 744-1023 px **and** height ≥ 960 px **and** `orientation: portrait`. It therefore never activates on a narrow/short desktop window nor in landscape. It comes **after** `sm:` in the cascade and overrides it. (Before 2026-09-24 it was used but defined nowhere — dead classes.)
- For each screen, start from `tablet:` (never `md:`), test at 820×1180, use heights in `dvh`, not `vh` (Safari iPad bar).
- Done:
  - **Layout**.
  - **Journal**: larger macro blocks; meals in a scroll-snap carousel **2 by 2** (`snap-start` every other card, 2 indicator dots per page).
  - **Planning**: **transposed** grid — days as rows, meals as columns `2fr/3fr/2fr/3fr`, meal headers in a separate row; same DOM as desktop via `grid-flow-col` (never a second render, otherwise duplicate dnd-kit ids); overflow `tablet:-mx-8` + `overflow-visible` to cancel the `main` padding.
  - Recipes search bar: `tablet:w-72`.
- Remaining screens: see `docs/roadmap.md`. The owner validates screen by screen.

## Page heading

Every main screen starts with `PageHeading` (`shared/components/layout/PageHeading.tsx`, owner 2026-11-26: titles were not aligned when switching screens): title `text-xl sm:text-2xl tablet:text-3xl font-black leading-tight` (truncated, optional `titleAside` such as the rename pencil) and a **mandatory** subtitle `mt-0.5 text-xs sm:text-sm text-slate-500` (truncated; a count or a short line when the screen has nothing else, e.g. « 4 catégories »), so the block has the same height everywhere and the title never moves. Root container `gap-4` under the heading (the Planning keeps `gap-2` on phones for its no-scroll day view, `sm:gap-4` above). Used by Aujourd'hui, Journal, Ma Semaine, Mes Recettes and a recipe category, Liste de courses and Articles du quotidien, the freezer and a freezer category. Not used by full-screen overlays (recipe detail, macro page, cooking mode) nor the admin screens.

## Modals and menus

- **Dismiss** (issue #71, owner 2026-11-26, replaces the former « no modal closes on backdrop click or Escape »): a window **without unsaved input** (reading, choice, confirmation) closes with Escape or a click on its backdrop through `useModalDismiss(onDismiss, enabled)` (`shared/hooks/`): it returns the backdrop props (`onPointerDown` + `onClick`: closes only when the press starts and ends on the backdrop, so a text selection ending outside never closes), and Escape only closes the topmost open window (module-level stack, every caller registers even when disabled). `enabled = false` while a save is pending. Wired: `LegalModal`, `NewsModal`, `WeekAverageModal`, `RecipePicker`, `DessertPicker`, `MoveDessertsPrompt` (Escape = « Annuler »), `ConfirmActionModal` (= cancel), `Sheet` with `dismissable` (`ShoppingItemSheet`, `RecipeCookingSheet`, `RecipeCostSheet`, `EstimateSheet`). **Form windows keep the former rule** (close only through their buttons) so a typed entry is never lost; `PricePerKgModal` keeps its own backdrop close. Existing modals that still close on backdrop (e.g. `NewsModal`) are left untouched until then.
- Mobile menus: overlay `fixed inset-0 z-10` + menu `z-20`.

## Component patterns

- `markScrolling` on `onScroll` of scrollable lists.
- `<select>` null guards: `value={x ?? Unit.NONE}` / `?? ""`.
- `AsyncImage`: with `fill` the wrapper is `absolute inset-0` (parent `relative`); otherwise `wrapperClassName` carries the size. Pass `asset` (preferred over `src`).
