# Glossary

Domain terms whose meaning is not obvious from the code. UI labels are French; code terms English.

| Term | Meaning |
|---|---|
| **Account / foyer** | One login = one household. Holds planning, shopping, household, freezer (shared by its members). |
| **Profile** (« Profils ») | One person of the household, without credentials (max 3). Holds targets and journal overrides. Not to be confused with `displayName`. |
| **`displayName`** | Name of the **account** (edited in `AccountModal`), display only. |
| **`freezerName`** | Display name of the account's freezer. |
| **Persons / portions / parts** | Planning `persons` ≡ recipe portions (`persons / defaultPortions` is the scale factor). « Parts » in the UI. |
| **Removed ingredient** (« retiré pendant la préparation », `removed`) | Recipe line linked to a food that is thrown away during the preparation (whey of a drained yogurt): positive quantity, subtracted from the recipe macros and weight, never bought (D-048). |
| **Gram override** (`recipeQuantities`, `gramsOverride`) | Quantity in grams for a weighed meal or base; not a number of portions. |
| **Cooked weight** (`cookedWeightGrams`, planned, D-041) | Weight of the whole finished dish after cooking (bread: less than the raw dough). Used only to convert grams eaten into a portion factor; macros still come from the ingredients. |
| **Override (journal)** | Per-day adjustment of a planned meal for one profile: portions, grams, or per-ingredient quantities. Never modifies the recipe. |
| **Base** | A recipe of kind `base` used as an ingredient of other recipes (`Ingredient.baseId`, quantity = portions of the base). |
| **Plannable item** | Anything that can be placed in the planning: a recipe or an outdoor activity (one identity in the API, `plannable_items`). |
| **Outdoor activity** | Plannable non-recipe entry (e.g. eating out), category `outdoor`. |
| **Recipe code** (`char-001`) | Internal key of a recipe (`buildRecipeDbId`). The API uuid is `apiId`. |
| **Image id** (`CHAR_01`) | Recipe id format used for image file names only (`buildRecipeId`). |
| **Slot** | One meal of one day in the planning (`breakfast`, `lunch`, `snack`, `dinner`). `SlotType` (planning slot) is distinct from `MealType` (which meals a recipe suits). |
| **Dessert-only slot** | Lunch/dinner slot with desserts and no main dish (`recipeIds: []`) — valid. |
| **Checked (household)** | « Coché » = **to buy** (`household_shopping_flags`, `flaggedAt`), not "done". |
| **Shopping period** | Server-side container of the current shopping days, checks, sources checks and extras. Recreated when the days change. |
| **Extra** | Manual line added to the shopping list (`ShoppingExtra`), key `extra::<id>`. |
| **Source check** | Check at the granularity recipe × day × slot in the shopping "meals" view. |
| **Batch cooking item** | Freezer item that is a cooked dish counted in portions (vs a food stored in bags). |
| **Stale (freezer)** | Item frozen for 90 days or more. |
| **News** (« Nouveautés ») | Recipes announced in the last 30 days (`announcedAt`). |
| **Demo account** | Ephemeral `guest` account with `isDemo`, created by « Essayer la démo », purged after ~2 h. |
| **Pending key** | Identifier of a business action in flight (`usePendingStore`), drives spinners and the double-click guard. |
| **Price store** | A shop (name, city) the food prices are tied to; global, created by admins, picked per account (D-043). |
| **Reference price** | The price per kg (per litre for liquids) of a food in a price store; the latest entry wins. |
| **Cooking sheet** (« fiche de cuisson ») | How one food is cooked one way (D-044): method, duration range, temperature (oven / air fryer), raw → cooked ratio, note. One per (food, method). |
| **Raw → cooked ratio** (`cookedRatio`) | Cooked grams ÷ raw grams for a food and a method (rice boiled ≈ 2.5). Display only: macros and prices stay on raw weights. Not the same as a dish's **cooked weight** (D-041). |
| **Missing price** | A line that cannot be priced (no price, no food link, or no unit weight for a piece); left out of the estimate, which turns orange. |
| **Snapshot** | Copy of an in-memory catalogue domain whose identity changes only when that domain changes (`useCatalogueSnapshot`). |
