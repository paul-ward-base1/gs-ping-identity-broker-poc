# ESLint Configuration Report

**Date:** April 9, 2026
**Branch:** `eslint-config`
**Author:** Fernando Kobayashi

---

## Executive Summary

The project was running ESLint with an essentially empty configuration — no rules were being enforced across 331 TypeScript/React source files. This report documents what was set up, why, and what issues it found.

After this change, ESLint now enforces rules across four dimensions:
1. **Next.js / React** — framework-specific best practices
2. **TypeScript** — type safety and import hygiene
3. **Code quality** — general correctness rules
4. **Storybook** — story file conventions

The first lint run detected **383 errors** and **120 warnings** that were previously invisible.

---

## Background — What Was There Before

The file `eslint.config.mjs` contained only this:

```js
export default [
  { ignores: ['.storybook/*', 'dist/*', 'build/*', 'node_modules/*'] },
];
```

That means ESLint was running but enforcing nothing. `yarn lint` always returned zero issues regardless of code quality.

Additionally, `eslint-config-next` (the Next.js linting preset) was already installed as a dependency but was never connected to the config — so its built-in rules for React, React Hooks, accessibility, and Next.js were silently ignored.

Storybook rules were configured in `package.json` via a legacy format that does not work with ESLint 9's flat config system.

---

## What Changed

### 1. New packages installed

| Package | Purpose |
|---------|---------|
| `typescript-eslint` | TypeScript-aware linting rules |
| `eslint-config-prettier` | Prevents ESLint and Prettier from fighting over formatting |

`eslint-config-next` and `eslint-plugin-storybook` were already installed and only needed to be wired in.

### 2. `eslint.config.mjs` — fully rewritten

The config now has four layers, each with a clear purpose:

```
eslint.config.mjs
├── next/core-web-vitals    → React, React Hooks, accessibility, Next.js
├── typescript-eslint       → TypeScript rules
├── custom rules            → Quality gates (no-console, eqeqeq, prefer-const, etc.)
├── storybook (*.stories.*) → Story file conventions
└── prettier (last)         → Formatting safety net
```

### 3. `package.json` — legacy block removed

The old `eslintConfig` block was removed from `package.json`. It used a legacy format incompatible with ESLint 9 and was redundant now that Storybook rules are properly configured in the flat config.

---

## Rules Enforced — Plain English

### React & Next.js (`next/core-web-vitals`)

| Rule | What it catches |
|------|----------------|
| `react-hooks/rules-of-hooks` | Hooks called inside conditions or loops (causes bugs) |
| `react-hooks/exhaustive-deps` | Missing dependencies in `useEffect` / `useCallback` (causes stale data) |
| `@next/next/no-img-element` | Raw `<img>` tags instead of Next.js `<Image>` (skips optimization) |
| `@next/next/no-html-link-for-pages` | Raw `<a>` tags instead of Next.js `<Link>` (skips client-side navigation) |
| `jsx-a11y/*` | Accessibility violations in JSX |

### TypeScript

| Rule | What it catches |
|------|----------------|
| `@typescript-eslint/no-explicit-any` | Using `any` type (defeats TypeScript's purpose) |
| `@typescript-eslint/no-unused-vars` | Variables/imports declared but never used |
| `@typescript-eslint/consistent-type-imports` | Type imports written as `import { Foo }` instead of `import type { Foo }` |
| `@typescript-eslint/no-non-null-assertion` | `value!` assertions that bypass null checks |
| `@typescript-eslint/ban-ts-comment` | `@ts-ignore` used where `@ts-expect-error` should be used |
| `@typescript-eslint/no-empty-object-type` | Empty interfaces `{}` used as types |

### Code Quality

| Rule | What it catches |
|------|----------------|
| `no-console` (warn) | `console.log` left in source code |
| `eqeqeq` | Using `==` instead of `===` |
| `prefer-const` | Variables declared with `let` but never reassigned |
| `no-debugger` | `debugger` statements left in code |

### Storybook

Applied only to `*.stories.*` files — standard Storybook conventions and patterns.

### Prettier integration

`eslint-config-prettier` is applied last. It disables ESLint rules that would conflict with Prettier's formatting decisions, so the two tools never fight each other.

---

## First Lint Run Results

Running `yarn lint` after this change produced:

| Severity | Count | Top rule |
|----------|-------|---------|
| Errors | 383 | `consistent-type-imports` (324) |
| Warnings | 120 | `no-explicit-any` (67) |

### Errors by rule

| Rule | Count | Meaning |
|------|-------|---------|
| `consistent-type-imports` | 324 | Type-only imports missing `import type` keyword |
| `no-empty-object-type` | 34 | Empty `{}` type used where `object` or a real type should be |
| `prefer-const` | 9 | Variables that could be `const` are declared as `let` |
| `no-unused-vars` | 6 | Imported names that are never used |
| `eqeqeq` | 3 | Loose equality checks (`==` instead of `===`) |
| `ban-ts-comment` | 3 | `@ts-ignore` that should be `@ts-expect-error` |
| `react/display-name` | 2 | Anonymous components missing display names |
| `no-wrapper-object-types` | 1 | `Object` (capital O) used as a type |
| `no-assign-module-variable` | 1 | `module` variable being reassigned (Next.js specific) |

### Warnings by rule

| Rule | Count | Meaning |
|------|-------|---------|
| `no-explicit-any` | 67 | `any` type used — type safety bypassed |
| `react-hooks/exhaustive-deps` | 31 | `useEffect`/`useCallback` with missing dependencies |
| `no-console` | 20 | `console.log` debug statements left in source |
| `no-non-null-assertion` | 1 | `value!` assertion bypassing null check |
| `next-script-for-ga` | 1 | Analytics script not using Next.js `<Script>` |

**Note:** These issues existed before this change — they are now visible for the first time, not newly introduced.

---

## What to Do Next

The 383 errors need to be resolved before lint can be used as a hard gate in CI. The recommended approach:

1. **Auto-fix the easy ones first** — `consistent-type-imports` (324 errors) and `prefer-const` (9 errors) can be fixed automatically:
   ```bash
   yarn eslint --fix src/
   ```

2. **Address `no-explicit-any` warnings** — 67 instances where `any` was used. These should be replaced with proper types, which will improve editor autocomplete and catch bugs earlier.

3. **Review `react-hooks/exhaustive-deps` warnings** — 31 instances of missing `useEffect`/`useCallback` dependencies. Each one is a potential stale closure bug (component shows outdated data without re-rendering).

4. **Add to CI** — once errors are resolved, add `yarn lint` (or `yarn lint --max-warnings 0`) to the CI pipeline to prevent regressions.

---

## Files Modified

| File | Change |
|------|--------|
| `eslint.config.mjs` | Full rewrite — from empty ignores block to complete rule set |
| `package.json` | Removed legacy `eslintConfig` block |
| `yarn.lock` | Updated with new packages |

## Packages Added

| Package | Version |
|---------|---------|
| `typescript-eslint` | `^8.58.1` |
| `eslint-config-prettier` | `^10.1.8` |
