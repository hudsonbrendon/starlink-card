# Starlink Card — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A HACS-distributable custom Lovelace card for Home Assistant's native `starlink` integration, using the user-supplied real Starlink Standard (Gen-3) product photo as the dish art with animated, state-driven overlays — in the visual spirit of denysdovhan/vacuum-card.

**Architecture:** A single Lit 3 web component (`starlink-card`) bundled by Rollup into one self-contained `starlink-card.js` (the supplied PNG is inlined as base64 so HACS only needs the JS module). Pure logic (state derivation, formatting) lives in small testable modules with Vitest unit tests. A GUI editor (`starlink-card-editor`) provides the Lovelace visual config. release-please drives fully automatic versioned GitHub Releases; a build workflow attaches the bundled JS as a release asset. A second PR adds the repo to the HACS default index.

**Tech Stack:** TypeScript, Lit 3, Rollup (babel + commonjs + node-resolve + terser + postcss + typescript2), custom-card-helpers, Vitest, ESLint + Prettier, GitHub Actions (release-please + build), HACS.

**Art rule:** The supplied photo (`src/images/starlink.png`, the user's exact file) is used AS-IS. No redraw. State visuals are CSS/SVG overlays around it. See memory `use-provided-assets-not-redraw`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json` | deps, scripts (`build`, `start`, `lint`, `test`) |
| `rollup.config.js` | bundle `src/starlink-card.ts` → `starlink-card.js`, inline PNG, terser |
| `tsconfig.json` | TS config (ES2021, experimentalDecorators) |
| `vitest.config.ts` | unit test runner (node env) |
| `hacs.json` | HACS metadata (`name`, `render_readme`, `filename`) |
| `src/starlink-card.ts` | the Lit card element + `customCards` registration |
| `src/editor.ts` | `starlink-card-editor` GUI config element |
| `src/state.ts` | **pure** `computeStatus(entities)` → status enum (PRIORITY ordered) |
| `src/format.ts` | **pure** `formatSpeed`, `formatPing`, `formatPercent` |
| `src/types.ts` | `StarlinkCardConfig`, `StarlinkStatus`, entity-key types |
| `src/const.ts` | card version, default entity-suffix map, status→color/label map |
| `src/styles.ts` | Lit `css` for card + keyframe animations (signal waves, dim, snow) |
| `src/localize/localize.ts` | tiny i18n loader |
| `src/localize/languages/en.json`, `pt-BR.json` | translations |
| `src/images/starlink.png` | the user's exact photo (copied from `art/ref.png`) |
| `.github/workflows/release-please.yml` | auto version + release + tag on push to main |
| `.github/workflows/build.yml` | on release published: build + upload `starlink-card.js` asset |
| `.github/workflows/lint.yml` | CI lint+build on PR |
| `release-please-config.json`, `.release-please-manifest.json` | release-please setup |
| `README.md` | install (HACS), config options table, screenshots |
| `LICENSE` | MIT, Hudson Brendon |
| `.gitignore`, `.prettierrc`, `.eslintrc.json` | tooling config |

---

## Status derivation (priority order — first match wins)

`computeStatus` reads boolean/state inputs and returns the first matching status:

1. `unavailable` — connected entity missing/unavailable
2. `stowed` — Stowed switch is `on`
3. `sleeping` — Sleep binary on
4. `offline` — Connected binary `off`
5. `obstructed` — Obstructed binary `on`
6. `thermal` — Thermal throttle binary `on`
7. `heating` — Heating binary `on`
8. `booting` — connected just turned on / last_restart < 2 min (optional; default `online` if unknown)
9. `online` — Connected `on`, nothing else

Each status maps to `{ label (i18n), color, animation }` in `const.ts`.

---

## Task 1: Project scaffold + tooling

**Files:** Create `package.json`, `tsconfig.json`, `.gitignore`, `.prettierrc`, `.eslintrc.json`, `vitest.config.ts`

- [ ] **Step 1: Write `package.json`** (deps: lit ^3.3.2, custom-card-helpers ^2.0.0, home-assistant-js-websocket ^9; devDeps: rollup + plugins, typescript, vitest, eslint, prettier). Scripts: `build`, `start`, `lint`, `test` (`vitest run`).
- [ ] **Step 2:** `npm install`, expect lockfile created, exit 0.
- [ ] **Step 3:** Write `tsconfig.json` (target ES2021, `experimentalDecorators`, `useDefineForClassFields:false`, moduleResolution node).
- [ ] **Step 4:** Write `vitest.config.ts` (environment `node`, include `src/**/*.test.ts`).
- [ ] **Step 5: Commit** scaffolding.

## Task 2: Pure logic — formatting (TDD)

**Files:** Create `src/format.ts`, `src/format.test.ts`

- [ ] **Step 1: Failing test** — `formatSpeed(182.4)` → `"182 Mbps"`, `formatSpeed(0.94)` → `"0.9 Mbps"`, `formatSpeed(null)` → `"—"`; `formatPing(28)` → `"28 ms"`; `formatPercent(2.13)` → `"2.1 %"`.
- [ ] **Step 2:** `npx vitest run src/format.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement `format.ts` (rounding rules: ≥10 → 0 dp, <10 → 1 dp; null/undefined/NaN → `—`).
- [ ] **Step 4:** vitest → PASS.
- [ ] **Step 5: Commit.**

## Task 3: Pure logic — status (TDD)

**Files:** Create `src/state.ts`, `src/state.test.ts`, `src/types.ts`

- [ ] **Step 1: Failing test** covering the priority table above (offline beats obstructed, stowed beats offline, unavailable beats all, online fallback).
- [ ] **Step 2:** vitest → FAIL.
- [ ] **Step 3:** Implement `computeStatus(StatusInputs): StarlinkStatus`.
- [ ] **Step 4:** vitest → PASS.
- [ ] **Step 5: Commit.**

## Task 4: Constants, styles, art asset

**Files:** Create `src/const.ts`, `src/styles.ts`, `src/images/starlink.png` (copy of user's photo)

- [ ] **Step 1:** Copy `art/ref.png` → `src/images/starlink.png`.
- [ ] **Step 2:** `const.ts`: CARD_VERSION, default entity suffix map (connected, obstructed, heating, thermal_throttle, sleep, stowed, downlink_throughput, uplink_throughput, ping, ping_drop_rate, restart), and `STATUS_META` (label key, color, animation name) per status.
- [ ] **Step 3:** `styles.ts`: Lit `css` — card shell, header, image stage (background-image inlined art), footer stats, and `@keyframes` for `wave` (signal), `dim`, `snow`, plus per-status modifier classes. Mirror `card-demo.html` look.
- [ ] **Step 4: Commit.**

## Task 5: The card element

**Files:** Create `src/starlink-card.ts`

- [ ] **Step 1:** Define `StarlinkCard extends LitElement`; `setConfig`, `hass` setter, `getCardSize`, static `getConfigElement`/`getStubConfig`, `customCards` push.
- [ ] **Step 2:** Resolve entities from config (explicit ids) or auto-derive by device/suffix; read states; call `computeStatus`.
- [ ] **Step 3:** `render()` — header (name + status label/color), image stage with status modifier class + animated signal SVG overlay, footer stats (download/upload/ping), tap → `more-info`, optional reboot/stow buttons.
- [ ] **Step 4:** i18n via `localize`.
- [ ] **Step 5:** `npm run build` → emits `starlink-card.js`, exit 0.
- [ ] **Step 6: Commit.**

## Task 6: GUI editor

**Files:** Create `src/editor.ts`

- [ ] **Step 1:** `StarlinkCardEditor extends LitElement` with `ha-form` schema (name, entity pickers for each role, toggles for showing stats/buttons).
- [ ] **Step 2:** Emit `config-changed` events.
- [ ] **Step 3:** `npm run build` passes.
- [ ] **Step 4: Commit.**

## Task 7: i18n

**Files:** Create `src/localize/localize.ts`, `languages/en.json`, `languages/pt-BR.json`

- [ ] **Step 1:** `localize(key, hass)` picks language from `hass.locale`/`hass.language`, falls back en.
- [ ] **Step 2:** Keys for every status label + stat labels (Download/Upload/Ping/Obstruction).
- [ ] **Step 3: Commit.**

## Task 8: Rollup bundle with inlined PNG

**Files:** Create `rollup.config.js`

- [ ] **Step 1:** Configure rollup: input `src/starlink-card.ts`, output `starlink-card.js` (es module), plugins incl. `@rollup/plugin-url` (or `image`/inline) to import the PNG as a base64 data URI, typescript2, postcss, terser.
- [ ] **Step 2:** `import dishImg from './images/starlink.png'` resolves to data URI used in `styles.ts`/render.
- [ ] **Step 3:** `npm run build` → single self-contained `starlink-card.js`; grep the output contains `data:image/png;base64,` and a `customElements.define('starlink-card'`.
- [ ] **Step 4: Commit.**

## Task 9: HACS + docs + license

**Files:** Create `hacs.json`, `README.md`, `LICENSE`, `.github/ISSUE_TEMPLATE/*` (optional)

- [ ] **Step 1:** `hacs.json` → `{ "name": "Starlink Card", "filename": "starlink-card.js", "render_readme": true }`.
- [ ] **Step 2:** `README.md`: badges, screenshot, HACS install steps, full YAML config options table, manual install, the entity mapping.
- [ ] **Step 3:** `LICENSE` MIT, "Hudson Brendon".
- [ ] **Step 4: Commit.**

## Task 10: CI — automatic release

**Files:** Create `.github/workflows/release-please.yml`, `build.yml`, `lint.yml`, `release-please-config.json`, `.release-please-manifest.json`

- [ ] **Step 1:** `lint.yml` — on PR/push: `npm ci`, `npm run lint`, `npm run build`, `npm test`.
- [ ] **Step 2:** `release-please.yml` — on push to `main`: `googleapis/release-please-action` (release-type `node`) → opens/maintains a release PR; on merge tags `vX.Y.Z` + creates GitHub Release.
- [ ] **Step 3:** `build.yml` — on `release: published`: `npm ci && npm run build`, then upload `starlink-card.js` to the release assets (softprops/action-gh-release or gh CLI).
- [ ] **Step 4:** Configure release-please manifest at version `0.1.0`.
- [ ] **Step 5: Commit.**

## Task 11: Repo creation + first release

- [ ] **Step 1:** Squash all task commits into ONE clean commit (memory `clean-git-history-before-publish`), author Hudson Brendon, NO Claude co-author (memory `no-claude-coauthor-commits`).
- [ ] **Step 2:** `gh repo create hudsonbrendon/starlink-card --public --source . --remote origin --push`.
- [ ] **Step 3:** Add repo topics: `home-assistant`, `lovelace`, `hacs`, `starlink`, `custom-card`.
- [ ] **Step 4:** Let release-please open its PR; merge it → triggers `v0.1.0` release; verify `build.yml` attached `starlink-card.js`.

## Task 12: HACS default PR

- [ ] **Step 1:** Confirm release `v0.1.0` exists with the JS asset and `hacs.json` present (HACS validation requirements).
- [ ] **Step 2:** Fork `hacs/default`, add `hudsonbrendon/starlink-card` to the `plugin` file (alphabetical).
- [ ] **Step 3:** Open PR to `hacs/default` per their template (the repo must pass the HACS action validation).

---

## Self-Review notes
- Spec coverage: card ✓ (T5), animated state art using real photo ✓ (T4/T5/T8), HACS ✓ (T9/T12), auto release via CI ✓ (T10/T11), repo creation ✓ (T11), no Claude co-author ✓ (T11), render options shown to user for choice ✓ (already done in this session before plan). 
- Type consistency: `StarlinkStatus` enum used identically in `state.ts`, `const.ts` (STATUS_META), `starlink-card.ts`. `computeStatus` name stable across T3/T5.
- Art: PNG inlined (T8) — verified by grepping data URI in bundle.
