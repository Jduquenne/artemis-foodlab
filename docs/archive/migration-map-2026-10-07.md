# Migration map — 2026-10-07

Traceability of the agent-context migration (former `CLAUDE.md` + WSL Claude Code auto-memory → `AGENTS.md`, `docs/`, `log/devlog.md`). Every block of the original files has a final status; non-`migrated` statuses were approved by the owner on 2026-10-07.

Originals: `docs/archive/CLAUDE-2026-10-07.md` (former `CLAUDE.md`). The auto-memory files (`MEMORY.md` + 38 files) were moved **out of the repository** to the owner's private folder, because they contain sensitive and personal details; they are not reproduced here.

Destinations: AG = AGENTS.md · ARC = docs/architecture.md · DEV = docs/development.md · CONV = docs/conventions.md · UI = docs/ui-design.md · API = docs/api.md · DEC = docs/decisions.md · RM = docs/roadmap.md · GLO = docs/glossary.md · LOG = log/devlog.md · SJ/SP/SR/SS/SF/SA/SD = docs/spec-journal / -planning / -recipes / -shopping / -freezer / -accounts / -admin.md
Sources: C = former CLAUDE.md · M = memory/MEMORY.md · mem:<file> = memory file.
Statuses: `migrated` · `merged with B-xxx` (duplicate) · `dropped (…), approved` · `moved out of repo (…), approved` · `stays in dev/, approved` (owner's untracked project management, linked only).

| Bloc | Source | Summary | Destination | Status |
|---|---|---|---|---|
| B-001 | C l.3-10 | dev / lint / preview commands | DEV § Commands | migrated |
| B-002 | C l.7 | `npm run build` forbidden, verify with tsc -b + lint | AG § Absolute rules | migrated |
| B-003 | C l.16 | PWA, login required, production not POC | AG § Preamble | migrated |
| B-004 | C l.17 | Priorities: scalability, architectural clarity | AG § Preamble | migrated |
| B-005 | C l.18 | UI in French | AG § Preamble | migrated |
| B-006 | C l.24 | Responsive via Tailwind prefixes | UI § Layout | migrated |
| B-007 | C l.25 | No-scroll layout on desktop (md:+) | UI § Layout | migrated |
| B-008 | C l.26 | Tailwind default, custom CSS allowed | UI § Styling | migrated |
| B-009 | C l.27 | Zero comments in code | CONV § Style (summary in AG) | migrated |
| B-010 | C l.28 | `tablet:` variant definition | UI § Tablet portrait | migrated |
| B-011 | C l.28 | Tablet: Journal + Planning treatment details | UI § Tablet portrait | migrated |
| B-012 | C l.28 | Tablet: remaining screens | RM | migrated |
| B-013 | C l.28 | Heights in dvh, not vh | UI § Tablet portrait | migrated |
| B-014 | C l.34 | Click mutations need instant pending feedback | CONV § Loading feedback | migrated |
| B-015 | C l.36-39 | Pending primitives (store, hooks, withPending, CheckToggleIcon) | CONV § Loading feedback | migrated |
| B-016 | C l.41 | Key per business action, not per request | CONV § Loading feedback | migrated |
| B-017 | C l.43 | Never withPending on free-text onChange | CONV § Loading feedback | migrated |
| B-018 | C l.45 | List rows needing pending hooks = own component | CONV § Loading feedback | migrated |
| B-019 | C l.47 | Where wired; modals keep local submitting | CONV § Loading feedback | migrated |
| B-020 | C l.53 | Desserts independent of main dish (invariant) | SP | migrated |
| B-021 | C l.55 | DnD with desserts: prompt + computeDragMoveSlots rules | SP | migrated |
| B-022 | C l.61 | WeekAverageModal | SJ | migrated |
| B-023 | C l.62 | Calorie target computed (Atwater), not editable | SJ (+ DEC D-021) | migrated |
| B-024 | C l.68 | Per-ingredient per-day quantities overview | SJ | migrated |
| B-025 | C l.70 | Unified override model | SJ | migrated |
| B-026 | C l.71 | POST /journal-overrides replaces 3 fields | API | migrated |
| B-027 | C l.72 | Pitfall: default qty scaled by current ratio | SJ | migrated |
| B-028 | C l.73 | Nested bases: one level only | SJ | migrated |
| B-029 | C l.74 | Unitless ingredients excluded | SJ | migrated |
| B-030 | C l.75 | calculateOverriddenRecipeMacros path | SJ | migrated |
| B-031 | C l.76 | Mobile carousel vs inner scroll | SJ | migrated |
| B-032 | C l.82 | Demo flow + API guard rails | SA (codes in API) | migrated |
| B-033 | C l.84 | Demo front pieces, refresh capped | SA | migrated |
| B-034 | C l.85 | Hidden in demo, excluded from UsersPanel | SA | migrated |
| B-035 | C l.86 | Hide demo-forbidden actions via useIsDemo | AG § Golden rules (detail SA) | migrated |
| B-036 | C l.92 | Profile = household person, max 3 | SA | migrated |
| B-037 | C l.94 | useProfileStore | SA | migrated |
| B-038 | C l.95 | overridesByProfile, persistOverride captures profileId | SA | migrated |
| B-039 | C l.96 | Targets via updateProfile, /journal-settings deprecated | SA | migrated |
| B-040 | C l.97 | ProfileSwitcher/ProfilesModal, colors hex inline | SA | migrated |
| B-041 | C l.98 | Deploy API before front | DEV § Branches and deployment | migrated |
| B-042 | C l.99 | displayName vs Profiles naming | GLO | migrated |
| B-043 | C l.105-111 | Three layers core/features/shared | ARC § Layers | migrated |
| B-044 | C l.115 | Business logic in core/logic/<feature>/ | ARC § Layers (summary AG) | migrated |
| B-045 | C l.116 | Pure named functions; core/logic never imports services | ARC § Layers | migrated |
| B-046 | C l.117 | Utils → shared/utils | ARC § Layers | migrated |
| B-047 | C l.118 | Hooks → shared/hooks | ARC § Layers | migrated |
| B-048 | C l.119 | Static data in dedicated file | ARC § Layers | migrated |
| B-049 | C l.120 | One component per file | CONV § Files | migrated |
| B-050 | C l.124, 157 | Never read core/catalogue directly; snapshots | ARC § Catalogue | migrated |
| B-051 | C l.125 | core/logic receives catalogue as param + allowed exceptions | ARC § Catalogue | migrated |
| B-052 | C l.126 | Only catalogueSyncService notifies | ARC § Catalogue | migrated |
| B-053 | C l.127 | Cross-device refresh useAppRefresh | ARC § Cross-device refresh (+ DEC D-017) | migrated |
| B-054 | C l.128, 177 | SVG card cache createCardCache | ARC § SVG cards | migrated |
| B-055 | C l.132 | Shared utilities list (reuse) | CONV § Reuse before writing | migrated |
| B-056 | C l.136 | Refactoring in progress, dev/refactoring.md | RM § Current focus (link dev/) | migrated |
| B-057 | C l.142 | Data flow step 1 "load from IndexedDB" | ARC § Data flow + Note (migration) | migrated (contradiction flagged as Note (migration)) |
| B-058 | C l.143-148 | Data flow steps 2-7 | ARC § Data flow | migrated |
| B-059 | C l.154 | Dexie v13, v14 abandoned | ARC § IndexedDB (+ DEC D-014) | migrated |
| B-060 | C l.155 | Never modify existing .version(n) | AG § Golden rules + ARC § IndexedDB | migrated |
| B-061 | C l.156 | Non-indexed field needs no new version | ARC § IndexedDB | migrated |
| B-062 | C l.158 | IndexedDB = read cache only | ARC § Source of truth, writes and errors | migrated |
| B-063 | C l.164 | Routes via React.lazy | CONV § React | migrated |
| B-064 | C l.165 | Routes inline in App.tsx, HashRouter, base | ARC § Routing | migrated |
| B-065 | C l.166 | Admin-only routes, unknown → /journal | ARC § Routing | migrated |
| B-066 | C l.167 | Sidebar 5 entries + admin icons in Layout.tsx | ARC § Routing | migrated |
| B-067 | C l.173 | RecipeDetail portion scaling | SR § Recipe detail and portions | migrated |
| B-068 | C l.175 | Open from planning with portions | SR § Recipe detail and portions | migrated |
| B-069 | C l.176 | Macros per portion invariant | SR § Recipe detail and portions | migrated |
| B-070 | C l.177 | Card cache key history (pre 2026-09-25) | LOG | migrated |
| B-071 | C l.178 | RecipeMacroPage not portion-aware | SR § Recipe detail and portions | migrated |
| B-072 | C l.184 | Builder download = SVG card PNG ×3 | SR § Recipe Builder | migrated |
| B-073 | C l.185 | InstructionsModal, paste split | SR § Recipe Builder | migrated |
| B-074 | C l.186 | Default portions 2 | SR § Recipe Builder | migrated |
| B-075 | C l.187 | Builder access points | SR § Recipe Builder | migrated |
| B-076 | C l.193-195 | CHAR_01 vs char-001 | ARC § Identifiers (term in GLO links there) | migrated |
| B-077 | C l.196 | apiId + recipeIdMap | ARC § Identifiers | migrated |
| B-078 | C l.197 | Mutable catalogues "without useLiveQuery" | ARC § Catalogue + Note (migration) | migrated (contradiction flagged as Note (migration)) |
| B-079 | C l.198 | Ingredient.id stable, PUT upsert | API § Catalogue writes | migrated |
| B-080 | C l.200 | Sheets Gateway abandoned | DEC D-003 (rejected) | migrated |
| B-081 | C l.206 | slate/white = CSS variables | UI § Theming (summary AG) | migrated |
| B-082 | C l.207 | dark: legit for non-slate | UI § Theming | migrated |
| B-083 | C l.208 | Class-based dark mode | UI § Theming | migrated |
| B-084 | C l.209 | Overlays/animations follow tokens | UI § Theming | migrated |
| B-085 | C l.215-218 | TS rules (any, as unknown as, enums EN, XxxProps) | CONV § TypeScript (summary AG) | migrated |
| B-086 | C l.224 | No sync setState in effect, reset-during-render pattern | CONV § React | migrated |
| B-087 | C l.225-227 | exhaustive-deps, no eslint-disable, react-refresh | CONV § React | migrated |
| B-088 | C l.233-234 | Domain predicates single source | CONV § Domain predicates + Note (they live in core/domain) | migrated (contradiction flagged as Note (migration)) |
| B-089 | C l.240 | API repo = sibling ../meals-planning-api | DEV § Prerequisites (relative path only) | migrated |
| B-090 | C l.242 | Prod since 2026-09-09, master=prod, Dev=work, VITE_API_URL | DEV § Branches and deployment / Env | migrated |
| B-091 | C l.244 | Writes API first, no optimistic, no offline queue | ARC § Source of truth, writes and errors (+ DEC D-005) | migrated |
| B-092 | C l.245 | Error handling via onApiError, suppressGlobalError | CONV § Error handling | migrated |
| B-093 | C l.246 | Recipe photos via /media, never store target | API § Media | migrated |
| B-094 | C l.247 | Render cold start, useDelayedFlag | DEV § Known issues | migrated |
| B-095 | C l.248 | Import POST /import | API § Import | migrated |
| B-096 | C l.249 | Planning items batch | API § Planning | migrated |
| B-097 | C l.250 | Front/back collaboration via relay prompts | AG § Absolute rules (detail API § Working with the API session) | migrated |
| B-098 | C l.251 | Pointer to memory files | — | dropped (replaced by docs/api.md), approved |
| B-099 | C l.257 | Commit format feature:/fix:/… | CONV § Commits | migrated |
| B-100 | C l.259 | Version bump package.json + public/version.json | CONV § Versioning (checklist AG) | migrated |
| B-101 | C l.261 | "commit" → reply with message only | AG § Absolute rules | migrated |
| B-102 | C l.265-277 | Issues in dev/issues.json + commands | AG § Picking work | migrated (file stays in dev/) |
| B-103 | M l.4 | Prod merge v6.61.0, tag prod-pre-api, prefer roll-forward | LOG + DEV § Branches and deployment (roll-forward) | migrated |
| B-104 | M l.5 | Issues state summary | — | stays in dev/, approved |
| B-105 | M l.6 | Cross inspection 2026-09-09 | LOG | migrated |
| B-106 | M l.7 | Refresh token localStorage decision | DEC D-007 | merged with B-176 |
| B-107 | M l.8 | Legal pages contain "À compléter par l'éditeur" | RM § Open items (owner actions) | migrated |
| B-108 | M l.9-10 | Pending rollout / desserts pointers | — | merged with B-014, B-020 |
| B-109 | M l.11 | Session 2026-09-21 | LOG | migrated |
| B-110 | M l.12-13 | Sessions 2026-09-24 | LOG | migrated |
| B-111 | M l.14 | Session 2026-09-25 refactor | LOG | migrated |
| B-112 | M l.15 | Session 2026-09-27 | LOG | migrated |
| B-113 | M l.16 | Session 2026-10-03 | LOG | migrated |
| B-114 | M l.17 | Session 2026-10-05 demo + ISO bug | LOG + RM § Known bugs | migrated |
| B-115 | M l.19-26 | API summary (duplicates) | — | merged with B-089..B-097 |
| B-116 | M l.27 | One issue = one commit, user commits | AG § Absolute rules | migrated |
| B-117 | M l.29-38 | Absolute rules (duplicates of C) | — | merged with C blocks |
| B-118 | M l.33 | Never touch .env* | AG § Absolute rules | merged with B-137 |
| B-119 | M l.34 | grep all consumers before removing an export | CONV § Refactoring safety and verification habits (AG golden) | merged with B-130 |
| B-120 | M l.35 | Logic > ~5 lines / JSX > 15 lines → separate | CONV § Files | migrated |
| B-121 | M l.36 | Animations: transform, never width/height | UI § Animations | migrated |
| B-122 | M l.37 | Runtime Tailwind classes not generated → literals / hex | UI § Styling | migrated |
| B-123 | M l.31 | Overlays bg-black/X, never bg-slate-900/X | UI § Theming | migrated |
| B-124 | M l.32 | Commit footer Co-Authored-By + Claude-Session | CONV § Commits | migrated |
| B-125 | M l.40-41 | Architecture pointer | — | dropped (pointer), approved |
| B-126 | mem:feedback_always_frame_relay_prompts | Always label relay prompt "for the API session" | AG § Absolute rules | migrated |
| B-127 | mem:feedback_avoid_tiny_abstractions | Helper only if ≥~5 occurrences, no wrapper around language constructs | CONV § Abstractions | migrated |
| B-128 | mem:feedback_business_logic_in_tsx | Extract inline logic (old path core/utils) | — | merged with B-120 (path fixed) |
| B-129 | mem:feedback_check_all_files… l.8-15 | tsc on WSL may give false negatives | DEV § Known issues › WSL (legacy) | migrated |
| B-130 | mem:feedback_check_all_files… | grep before removing export (HouseholdCard story) | CONV § Refactoring safety and verification habits | migrated |
| B-131 | mem:feedback_cross_session_relay_workflow | Relay workflow, don't guess complex contracts | API § Working with the API session | migrated |
| B-132 | mem:feedback_cross_session_relay_workflow l.25-26 | Empirical local verification method (curl, throwaway account) | API § Working with the API session | migrated |
| B-133 | mem:feedback_cross_session_relay_workflow l.27 | Don't merge a change depending on undeployed endpoint | AG § Absolute rules (+ DEV § Branches and deployment) | migrated |
| B-134 | mem:feedback_eslint_set_state_in_effect | setState-in-effect lint + key on parent | — | merged with B-086 |
| B-135 | mem:feedback_eslint_set_state_in_effect l.20 | No browser → report "tsc + lint only, test with npm run dev" | AG § Before you finish | migrated |
| B-136 | mem:feedback_eslint_set_state_in_effect l.21 | `pkill -f vite` exit 144 | DEV § Known issues › WSL (legacy) | migrated |
| B-137 | mem:feedback_never_touch_env_files | Never edit .env*, test API via curl | AG § Absolute rules | migrated |
| B-138 | mem:feedback_pause_test_means_end_of_session | "pause test" = end of session → update docs/devlog/dev/refactoring.md | AG § Session protocol | migrated (adapted) |
| B-139 | mem:feedback_refacto_one_commit_per_step | One commit per step, wait for owner, plan first | AG § Session protocol | migrated |
| B-140 | mem:feedback_refacto_one_commit_per_step l.12 | Say honestly whose suggestion is better | AG § Absolute rules | migrated |
| B-141 | mem:feedback_verify_against_committed_data | Verify structural assumptions against real data/code | AG § Absolute rules | migrated |
| B-142 | mem:feedback_verify_against_committed_data (Sheets/JSON details) | Sheets-era specifics | — | dropped (obsolete), approved |
| B-143 | mem:project_architecture l.13-39 | Structure 2026-06-03 | — | dropped (obsolete), approved |
| B-144 | mem:project_architecture l.41-50 | Placement rule decided 2026-06-03 | DEC D-001 | migrated |
| B-145 | mem:project_architecture l.23 | `as unknown as` confined to catalogue | — | dropped (now forbidden everywhere), approved |
| B-146 | mem:project_auth_token_ttl l.11-17 | TTL 30 d prod, local .env differs, diagnose local vs prod | DEV § Debugging | migrated |
| B-147 | mem:project_auth_token_ttl l.19-20 | Real cause of logouts, isRefreshRejected + retries | SA § Session (+ LOG) | migrated |
| B-148 | mem:project_auth_token_ttl l.22-28 | 2026-09-30 status unresolved, SQL test, proposed trace | RM § Known bugs + DEV § Debugging + LOG | migrated |
| B-149 | mem:project_boot_optimization l.13-21 | GET /bootstrap contract + integration | API § Bootstrap + ARC § Boot (+ DEC D-016) | migrated |
| B-150 | mem:project_boot_optimization l.23-33 | Media overrides persistence (first version) | LOG | migrated |
| B-151 | mem:project_boot_optimization l.35-37 | DevTools throttling false alarm | DEV § Debugging | migrated |
| B-152 | mem:project_boot_optimization l.11 | ETag/304 remaining | RM § Ideas / later | migrated |
| B-153 | mem:project_core_refactoring_2026_09 | Refactor scope done 6.74.1→6.75.23 | LOG | migrated |
| B-154 | mem:project_core_refactoring_2026_09 l.12 | Remaining: core/services, features, shared | RM § Current focus | migrated |
| B-155 | mem:project_core_refactoring_2026_09 l.16 | Check existing utils first; prove equivalence on random cases | CONV § Refactoring safety and verification habits | migrated |
| B-156 | mem:project_dashboard_planning_usage l.11-17 | Need + decisions (planned = done, own planning) | SD (+ DEC D-030) | migrated |
| B-157 | mem:project_dashboard_planning_usage l.19-22 | Why blocked | — | dropped (resolved), approved |
| B-158 | mem:project_dashboard_planning_usage l.24-31 | recipe-usage contract | API § Planning | migrated |
| B-159 | mem:project_dashboard_planning_usage l.33-39 | Front implementation PlanningUsageCard | SD | migrated |
| B-160 | mem:project_dashboard_planning_usage l.41-67 | Initial relay + todo | — | dropped (done), approved |
| B-161 | mem:project_demo_account l.1-6 | No register; demo account decision + why | DEC D-013 (neutral wording) | migrated |
| B-162 | mem:project_demo_account l.7 | Guard rails / front | — | merged with B-032..B-034 |
| B-163 | mem:project_demo_account l.9 | ISO year bug (getFullYear) | RM § Known bugs | migrated |
| B-164 | mem:project_freezer_ui l.13-21 | Category color contract + palette + picker | SF (contract in API) | migrated (paths updated) |
| B-165 | mem:project_freezer_ui l.23-30 | Category card | SF | migrated |
| B-166 | mem:project_freezer_ui l.32-38 | Detail rows, relative age, stale ≥ 90 d | SF | migrated |
| B-167 | mem:project_frontend_api_integration l.11-25 | Refresh token in body: cause, decision, front | DEC D-007 + SA § Session | migrated |
| B-168 | mem:project_frontend_api_integration l.25 | Residual race changePassword / refresh | SA § Session | migrated |
| B-169 | mem:project_frontend_api_integration l.31-36 | Prod launch facts (Render, build, health) | DEV § Branches and deployment (no project id) + LOG | migrated |
| B-170 | mem:project_frontend_api_integration l.36 | Supabase project id, .env.e2e | — | moved out of repo (sensitive), approved |
| B-171 | mem:project_frontend_api_integration l.38 | CORS facts | API § General | migrated |
| B-172 | mem:project_frontend_api_integration l.39 | media Cache-Control 45 s | — | dropped (superseded), approved |
| B-173 | mem:project_frontend_api_integration l.40 | Rate limits | API § General | migrated |
| B-174 | mem:project_frontend_api_integration l.41 | Refresh cookie only | — | dropped (superseded), approved |
| B-175 | mem:project_frontend_api_integration l.43-47 | 2 gaps verified, Render build check | LOG | migrated |
| B-176 | mem:project_frontend_api_integration l.51-82 | State 2026-09-08 + backend pending list | LOG ; still-open items (optional ids, forceable announcedAt, media immutable/thumbHash) → RM § Ideas / later | migrated |
| B-177 | mem:project_frontend_api_integration l.84-99 | Commit history #1-#4, #7, #5, #9, #8 | LOG | migrated |
| B-178 | mem:project_frontend_api_integration l.87 | CRLF noise fixed by .gitattributes + autocrlf input | DEV § Known issues | migrated |
| B-179 | mem:project_frontend_api_integration l.96 | localStorage keys removed / kept list | ARC § Client storage | migrated |
| B-180 | mem:project_frontend_api_integration l.97 | .env.production committed (not a secret) | DEV § Environment variables | merged with B-090 |
| B-181 | mem:project_frontend_api_integration l.101 | syncRecipeFromApi targeted refresh | ARC § Catalogue | migrated |
| B-182 | mem:project_frontend_api_integration l.105-111 | announcedAt / News feature | SR § News (« Nouveautés ») + API § Catalogue writes | migrated |
| B-183 | mem:project_frontend_api_integration l.111 | Incident: code deployed before migration | DEV § Branches and deployment (lesson) + LOG | migrated |
| B-184 | mem:project_frontend_api_integration l.116-125 | Structural integration decisions (codes, food ids, planning, freezer uuid, journal keys, shopping grouping) | ARC § Identifiers / Domain model | migrated |
| B-185 | mem:project_frontend_api_integration l.127-130 | Bugs fixed (journal-settings race, StrictMode refresh; multi-tab not covered) | LOG + SA § Session | migrated |
| B-186 | mem:project_frontend_api_integration l.132-145 | Session 2026-09-09 dashboard commits + ConfirmActionModal | LOG + SD | migrated |
| B-187 | mem:project_frontend_api_integration l.137 | Version regression note | — | dropped (obsolete), approved |
| B-188 | mem:project_frontend_api_integration l.147 | Editable categories abandoned | DEC D-014 (rejected) | migrated |
| B-189 | mem:project_frontend_api_integration l.147 | Plan path ~/.claude/plans/… | — | moved out of repo (personal path), approved |
| B-190 | mem:project_frontend_api_integration l.151-156 | Dashboard #14 state | SD | migrated |
| B-191 | mem:project_frontend_api_integration l.158-159 | /users last-admin 409 | API § Users | migrated |
| B-192 | mem:project_frontend_api_integration l.161-162 | .env required for dev | DEV § Environment variables | migrated |
| B-193 | mem:project_google_auth l.13-16 | Google auth product decisions | DEC D-029 (proposed) | migrated |
| B-194 | mem:project_google_auth l.18-24 | POST /auth/google planned contract, don't code yet | API § Planned | migrated |
| B-195 | mem:project_google_auth l.26-35 | Google Cloud setup (owner) + what can advance | RM § Blocked | migrated |
| B-196 | mem:project_journal_ingredient_overrides l.1-15 | Status + need | LOG | merged with B-024 |
| B-197 | mem:project_journal_ingredient_overrides l.17-21 | Bug + key files | — | merged with B-027 |
| B-198 | mem:project_journal_ingredient_overrides l.23-27 | 4-issue split #16-#19 | LOG | migrated |
| B-199 | mem:project_journal_ingredient_overrides l.29-34 | Design decisions (unified model, one level, strict ids, cascade, DB persistence) | DEC D-011 | migrated |
| B-200 | mem:project_journal_ingredient_overrides l.36-39 | Architecture before + RecipeMacroPage precedent | — | dropped (obsolete), approved |
| B-201 | mem:project_meals_planning_api l.14-23 | New separate API repo decision + scope | DEC D-002 | migrated |
| B-202 | mem:project_meals_planning_api l.25-33 | Hosting Supabase + Render, no credit card | DEC D-004 | migrated |
| B-203 | mem:project_meals_planning_api l.34-36 | Photo flow via CDN | — | dropped (superseded by D-015), approved |
| B-204 | mem:project_meals_planning_api l.37-42 | Bulk read, nested shape, offline reduced, auth | DEC D-005 | migrated |
| B-205 | mem:project_meals_planning_api l.44-52 | Reusable from Sheets attempt + spec style | — | dropped (obsolete), approved |
| B-206 | mem:project_meals_planning_api l.53-60 | Naming review (is_, household_shopping_flags, plannable_items) | GLO + DEC D-006 | migrated |
| B-207 | mem:project_meals_planning_api l.61-67 | Seed admin, Prisma practice, error envelope, endpoint list | API § General (envelope) ; rest | migrated / dropped (API repo concern), approved |
| B-208 | mem:project_meals_planning_api l.69-73 | Start prompt artifact URL | — | moved out of repo (private URL), approved |
| B-209 | mem:project_meals_planning_api l.74-76 | API conventions + old commit inconsistency | — | dropped (obsolete), approved |
| B-210 | mem:project_meals_planning_api l.77-87 | Spec 2026-07-21 + structural model decisions | DEC D-006 + ARC § Domain model | migrated |
| B-211 | mem:project_meals_planning_api l.88-90 | Shopping grouping by foodId FK | DEC D-022 | migrated |
| B-212 | mem:project_meals_planning_api l.91-93 | Roles & permissions | ARC § Auth and roles | migrated |
| B-213 | mem:project_meals_planning_api l.94-102 | Open point + next steps | — | dropped (resolved), approved |
| B-214 | mem:project_media_resolve l.13-14 | Private bucket, long signed URLs, batch resolve | DEC D-015 | migrated |
| B-215 | mem:project_media_resolve l.16-29 | /media/resolve contract | API § Media | migrated |
| B-216 | mem:project_media_resolve l.31-47 | Front media pipeline | ARC § Media (updated with B-262) | migrated |
| B-217 | mem:project_media_resolve l.49-51 | v1 limits | ARC § Media | migrated |
| B-218 | mem:project_media_resolve l.53-57 | Prod test list, branch state | — | dropped (done), approved |
| B-219 | mem:project_pending_feedback_rollout l.11-15 | Origin + not in apiClient | DEC D-008 | migrated |
| B-220 | mem:project_pending_feedback_rollout l.17-19 | Pitfalls | — | merged with B-017, B-018 |
| B-221 | mem:project_pending_feedback_rollout l.20 | Parallel agents on same checkout → transient lint errors | DEV § Known issues | migrated |
| B-222 | mem:project_pending_feedback_rollout l.22-23 | Freezer bag unit required by API | SF + LOG | migrated |
| B-223 | mem:project_pending_feedback_rollout l.25-27 | Final state | — | merged with B-019 |
| B-224 | mem:project_planning_desserts l.11-23 | Discovery + dessert-alone fix | SP + LOG | migrated |
| B-225 | mem:project_planning_desserts l.24-31 | DnD 3 cases | — | merged with B-021 |
| B-226 | mem:project_planning_desserts l.32-34 | Swap bug; always test round-trip | CONV § Refactoring safety and verification habits | migrated |
| B-227 | mem:project_planning_desserts l.35-38 | Batch endpoint, no fallback | DEC D-009 | migrated |
| B-228 | mem:project_planning_desserts l.39-40 | DessertCell click navigates | SP | migrated |
| B-229 | mem:project_planning_search_perf | Picker results capped 30 + useDeferredValue, limit | SP (+ DEC D-026) | migrated |
| B-230 | mem:project_profile_account l.11-20 | Account decisions (no email reset, displayName, recovery, email change) | DEC D-025 + SA | migrated |
| B-231 | mem:project_profile_account l.22-30 | Account needs list | SA § Account screen | migrated |
| B-232 | mem:project_profile_account l.32-36 | /me, /me/password contract | API § Auth and session | migrated |
| B-233 | mem:project_profile_account l.37-46 | Front AccountModal | SA § Account screen | migrated |
| B-234 | mem:project_profile_account l.47-69 | Relay + todo | — | dropped (done), approved |
| B-235 | mem:project_profiles_feature l.11-24 | Profiles decisions + why | DEC D-012 | migrated |
| B-236 | mem:project_profiles_feature l.20-26 | API/front design | — | merged with B-036..B-040 + API § Journal and profiles |
| B-237 | mem:project_profiles_feature l.27 | Delivered v6.73.0, key bug | LOG | migrated |
| B-238 | mem:project_profiles_feature l.29-31 | V2 tastes idea (#20-#24) | RM § Ideas / later (link only) | stays in dev/, approved |
| B-239 | mem:project_recipe_builder_refacto l.13-17 | Removed Sheets-era outputs | LOG | migrated |
| B-240 | mem:project_recipe_builder_refacto l.19-26 | PhotoPanel, recap, auto number, validation | SR § Recipe Builder | migrated |
| B-241 | mem:project_recipe_builder_refacto l.28-35 | Builder layout desktop/mobile | SR § Recipe Builder | migrated |
| B-242 | mem:project_recipe_builder_refacto l.37-39 | Unchanged list | — | dropped, approved |
| B-243 | mem:project_recipe_builder_refacto l.41-47 | Session 2026-09-21 details | LOG ; behaviour merged with B-072..B-075 | migrated |
| B-244 | mem:project_recipe_portions_scaling l.1-11 | Need (scaling for N people) | SR § Recipe detail and portions (neutral wording) | migrated |
| B-245 | mem:project_recipe_portions_scaling l.13-21 | Implementation | — | merged with B-067..B-069 |
| B-246 | mem:project_recipe_portions_scaling l.23-24 | Card cache pitfall | — | merged with B-070 |
| B-247 | mem:project_recipe_portions_scaling l.26-29 | Limits (macro page, journal, instructions photo, untested) | SR § Recipe detail and portions | migrated |
| B-248 | mem:project_refacto_progress | June refactor progress | LOG (one line, before 2026-07) | migrated |
| B-249 | mem:project_scroll_restore_and_food_rename l.1-5 | Scroll restore hook | SR § Catalogue browsing and search + CONV § Reuse before writing | migrated |
| B-250 | mem:project_scroll_restore_and_food_rename l.7 | Food rename cascade, backfill to run, open question | API § Catalogue writes + RM § Open items (owner actions) | migrated |
| B-251 | mem:project_session_2026_10_03 l.13-18 | parseDecimal + DecimalInput rule | CONV § Forms and numeric input (golden rule AG) | migrated |
| B-252 | mem:project_session_2026_10_03 l.19-24 | Media cache fix + onRehydrateStorage pitfall | ARC § Media + CONV § React | migrated |
| B-253 | mem:project_session_2026_10_03 l.25-32 | Recipe filters by type + medians | SR § Filters (+ DEC D-020) | migrated |
| B-254 | mem:project_sheets_gateway | Abandonment + transferable notes | — | merged with B-080 ; details dropped |
| B-255 | mem:project_shopping_extras l.11-19 | Extras need + decisions | SS § Manual items | migrated |
| B-256 | mem:project_shopping_extras l.21-23 | Shopping architecture recap | SS § Shopping list model | migrated |
| B-257 | mem:project_shopping_extras l.25-46 | Extras contract | API § Shopping and household | migrated |
| B-258 | mem:project_shopping_extras l.48-80, 94-101 | Relay + todo | — | dropped (done), approved |
| B-259 | mem:project_shopping_extras l.82-92 | Front implementation | SS § Manual items | migrated |
| B-260 | mem:project_tablet_portrait | Context (iPad portrait user), decisions, w-72 search, how to apply | UI § Tablet portrait (neutral) | merged with B-010..B-013 |
| B-261 | mem:reference_api_write_endpoints l.13-31 | Catalogue write contracts + category slugs | API § Catalogue writes (PUT recipes upsert fixed) | migrated |
| B-262 | mem:reference_api_write_endpoints l.32-50 | Photo upload, outdoor in planning, GET /recipes/:uuid | API | migrated |
| B-263 | mem:reference_api_write_endpoints l.35-44 | Planning batch contract | API § Planning | merged with B-096 |
| B-264 | mem:reference_api_write_endpoints l.51-58 | Import contract | API § Import | merged with B-095 |
| B-265 | mem:reference_api_write_endpoints l.59-63 | CORS/cookie, master recipes list | API § General / dropped list | migrated / dropped (API repo concern), approved |
| B-266 | mem:reference_api_write_endpoints l.64-70 | /users contract (JWT 15 min outdated) | API § Users + Note (migration) | migrated |
| B-267 | mem:reference_architecture_notes l.13-31 | Structure, cache, IndexedDB tables, types | ARC | merged with C blocks |
| B-268 | mem:reference_architecture_notes l.32-34 | Routing (SidebarNav stale) | — | merged with B-066 |
| B-269 | mem:reference_architecture_notes l.35-42 | Dashboard admin | SD | migrated |
| B-270 | mem:reference_architecture_notes l.43-45 | useSearch semantics | ARC § Hooks of note | migrated |
| B-271 | mem:reference_architecture_notes l.46-53 | Shopping / household / import | SS | migrated |
| B-272 | mem:reference_architecture_notes l.54-58 | MealSlot model | ARC § Domain model | migrated |
| B-273 | mem:reference_architecture_notes l.59-65 | Freezer, account | — | merged with B-164, B-233 |
| B-274 | mem:reference_architecture_notes l.66-72 | Stores list | ARC § Stores | migrated |
| B-275 | mem:reference_architecture_notes l.73-78 | SVG cards / builder mapping | ARC § SVG cards | migrated |
| B-276 | mem:reference_architecture_notes l.79-83 | Component conventions (markScrolling, menus z-index, select guards, AsyncImage, no-scroll pattern) | UI § Component patterns | migrated |
| B-277 | mem:reference_sheets_structure | Google Sheet structure | — | dropped (obsolete), approved |
| B-278 | dev/refactoring.md | Review journal | — | stays in dev/, approved |
| B-279 | dev/issues.json | Backlog | — | stays in dev/, approved |
| B-280 | .claude/settings.json | Plugin frontend-design | .claude/settings.json | migrated (merged) |
| B-281 | .claude/settings.local.json | Tracked although gitignored | RM § Open items (owner actions) (owner: git rm --cached) | migrated |
| B-282 | several memory files | Private-life context of the owner | — | moved out of repo (personal; reworded neutrally where needed), approved |
