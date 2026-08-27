# Unit Tests Report

This document describes each unit test file, the function under test, and the purpose of each test case.

> **Coverage philosophy:** Unit tests are focused on pure business logic — functions with non-trivial branching, data transformation, or query-building logic. React components and hooks are excluded (better covered by Storybook/Playwright). Thin wrappers that forward data straight to a third-party API (e.g. `gtmTracker`) are also excluded — they have no branching logic to guard.

---

## `tests/unit/lib/unflatten.test.ts` — `unflatten()`

**Why test this:** The recursive key-splitting and parent-object merging logic has several failure modes (overwriting a shared parent, dropping non-string values, mishandling edge cases like empty input or no-dot keys). Being a foundational utility used for i18n dictionaries, a regression here would silently corrupt all translated strings.

| Test | Purpose |
|------|---------|
| returns empty object for empty input | Baseline: no keys → empty result |
| returns same key for single-segment key | Keys without dots must pass through unchanged |
| nests two-segment key into nested object | Core functionality: `'a.b'` → `{ a: { b: ... } }` |
| nests three-segment key deeply | Verifies recursive nesting beyond two levels |
| merges multiple keys sharing a prefix | Two keys like `a.x` and `a.y` must share the same parent object, not overwrite it |
| handles mixed nesting depths | Flat and nested keys can coexist in the same input |
| preserves non-string values | `null` and arrays must survive the transformation unchanged |

---

## `tests/unit/utils/programLevelUtils.test.ts` — `checkAllLevels()`

**Why test this:** Used to decide whether to show an "All Levels" badge tag instead of individual level tags. The logic uses `Array.every` against a hardcoded list of six levels — edge cases like `undefined`, empty array, or extra values are easy to break silently during refactors.

| Test | Purpose |
|------|---------|
| returns true when all six program levels are present | Happy path: all levels supplied |
| returns false when only some levels are present | Partial list must not be treated as "all" |
| returns false when undefined is passed | Callers may pass `undefined`; must not throw |
| returns false for empty array | Empty is not "all" |
| returns true when all levels are present plus extras | Extra values beyond the six are irrelevant |

---

## `tests/unit/lib/locale.test.ts` — `getLocale()` / `pathnameHasLocale()`

**Why test this:** Both functions are used in Next.js middleware and route guards — incorrect locale detection causes wrong page rendering or infinite redirects. The fallback-to-`'en'` behaviour for unknown locales is a critical contract that must survive changes to the `locales` array.

### `getLocale`

| Test | Purpose |
|------|---------|
| extracts "en" from English pathname | Happy path for the primary locale |
| extracts "es" from Spanish pathname | Happy path for the secondary locale |
| defaults to "en" for unknown locale segment | Unsupported locales must fall back gracefully |
| defaults to "en" for root path | `/` has no locale segment |
| defaults to "en" for empty string | Defensive: empty input must not throw |

### `pathnameHasLocale`

| Test | Purpose |
|------|---------|
| returns true for exact "/en" | Locale-only path without trailing slash |
| returns true for path starting with "/en/" | Most common case: locale prefix on a real page |
| returns true for "/es/badges" | Validates Spanish locale is recognised |
| returns false for unknown locale prefix | Unknown locales must not be treated as valid |
| returns false for root path | `/` has no locale prefix |

---

## `tests/unit/utils/urlUtils.test.ts` — `encodeFiltersToUrl()` / `decodeFiltersFromUrl()`

**Why test this:** These form a round-trip used to persist filter state in the URL. `decodeFiltersFromUrl` silently drops unknown IDs — this whitelist validation is a security boundary that prevents injecting arbitrary filter values. The round-trip contract (encode → decode produces the original filters) must hold across refactors.

### `encodeFiltersToUrl`

| Test | Purpose |
|------|---------|
| returns empty string for empty filters array | No filters → clean URL |
| encodes a single filter with one value | Basic serialisation: `level=daisy` |
| encodes a filter with multiple values as repeated params | Multi-value filters must be repeated, not comma-joined |
| encodes multiple filter types into a single query string | Different filter types produce independent params |

### `decodeFiltersFromUrl`

| Test | Purpose |
|------|---------|
| returns empty array for empty search params | No params → no filters |
| returns empty array when param IDs do not match any known filter | Unknown IDs are silently dropped (prevents injection of invalid filter IDs) |
| decodes a single known filter value | Happy path parse |
| decodes multiple values for the same filter type | Repeated same-type params are grouped into one `SelectedFilter` |
| decodes filters of different types into separate entries | Different param keys produce separate `SelectedFilter` objects |

---

## `tests/unit/lib/search/api/search.test.ts` — `searchParamsInvalid()`

**Why test this:** Guards the search API route (`/api/search/[type]/[lang]`) from being called with unsupported types or locales. Returning `false` when the input is invalid would expose the OpenSearch query layer to untrusted input.

| Test | Purpose |
|------|---------|
| returns false for valid activity type and "en" locale | Primary happy path |
| returns false for valid badge type and "es" locale | Validates both search types and both locales |
| returns true for invalid search type | Unknown type string must be rejected |
| returns true for invalid locale | Unsupported locale must be rejected |
| returns true when both type and locale are invalid | Both-invalid case must still return true |

---

## `tests/unit/lib/search/url/searchUrl.test.ts` — `SearchUrlFactory.build()`

**Why test this:** Builds the URL the browser sends to the search API. Bugs here silently drop filters, send wrong pagination, or produce non-canonical URLs that break browser history. The "omit defaults" rule (page 0, limit 20, `a-z` sort) is easy to regress.

### `activitySearchUrlFactory.build`

| Test | Purpose |
|------|---------|
| returns base URL when all params are defaults | All defaults → minimal URL, nothing appended |
| appends search term as q param | Term must appear as `q=<term>` |
| omits q param when term is empty string | Empty string is not a search term |
| omits q param when term is null | Null term must be treated the same as absent |
| appends program level filter | `level=<id>` param added for each level |
| appends multiple program level filters as repeated params | Multi-level filter is repeated, not joined |
| appends badge family filter | `family=<id>` param |
| appends theme filter | `theme=<id>` param |
| appends non-default page number | Page > 0 is included in URL |
| omits page param when page equals default (0) | Page 0 is implicit; omitting it keeps URLs canonical |
| appends non-default limit | Limit ≠ 20 must be surfaced |
| omits limit param when limit equals default (20) | Default limit is implicit |
| omits sort param when sort is default (title ascending) | `a-z` sort is implicit |
| appends sort=z-a for title descending | Non-default sort appears as `sort=z-a` |
| appends sort=level-asc for program level ascending | Program-level sort ascending |
| appends sort=level-desc for program level descending | Program-level sort descending |
| URL-encodes special characters in term | Space → `%20`; other special chars must be safe |

### `badgeSearchUrlFactory.build`

| Test | Purpose |
|------|---------|
| returns base URL for badge type with Spanish locale | Base URL uses correct type and locale segments |
| appends search term for badge query | Same term logic applies to badge factory |
| appends badge family filter for badge query | Filter encoding is shared with activity factory |

---

## `tests/unit/utils/isExternalLink.test.ts` — `isExternalLink()`

**Why test this:** Pure function with three independent conditions (`http://`, `https://`, `www.`) combined with a hostname exclusion check. The combination is easy to get wrong — a same-hostname `https://` link must return `false`, but the naive implementation would return `true`. Used to decide whether to open links in a new tab.

| Test | Purpose |
|------|---------|
| returns false for null href | Null is not a link at all |
| returns false for empty string href | Empty string is not a link at all |
| returns false for a relative path | Relative paths are always internal |
| returns false for an https link to the same hostname | Same-origin https must not be treated as external |
| returns true for an https link to a different hostname | Standard external https link |
| returns true for an http link to a different hostname | http (not just https) must be caught |
| returns true for a www link to a different hostname | `www.` prefix without protocol counts as external |
| returns false for a www link containing the same hostname | Same hostname via www must not be treated as external |

---

## `tests/unit/utils/buildImagePath.test.ts` — `buildImagePath()`

**Why test this:** Builds every image URL used in the app by prepending the AEM base URL. Three distinct code paths (undefined input, Storybook path, normal AEM path) and a leading-slash-stripping step that doubles up slashes if broken. A regression here breaks all images site-wide.

| Test | Purpose |
|------|---------|
| returns empty string for undefined path | Guard against undefined — must not produce `"undefined"` string |
| returns empty string for empty string path | Empty path is treated as absent |
| returns storybook paths unchanged | Storybook asset paths must not be prefixed with the AEM URL |
| prepends envUrl and strips leading slash | Core case: `/content/dam/image.png` → `https://aem.example.com/content/dam/image.png` |
| prepends envUrl when path has no leading slash | Path without leading slash must also work without double-slash |

---

## `tests/unit/lib/search/aws/query/sortSettingsFactory.test.ts` — `SortSettingsFactory.fromQuery()`

**Why test this:** Translates the UI sort selection into the OpenSearch sort clause. Getting the field name wrong (`name` vs `name.keyword`) or delegating to the wrong provider breaks all sorted search results. The branching on `SortType.PROGRAM_LEVEL` vs title sort is the key decision to guard.

| Test | Purpose |
|------|---------|
| sorts by name.keyword ascending for title ascending sort | Correct OpenSearch field name and order direction |
| sorts by name.keyword descending for title descending sort | Descending title sort uses the same field |
| delegates to programLevelProvider for program level ascending sort | Provider is called with the correct order |
| delegates to programLevelProvider for program level descending sort | Provider is called with descending order |

---

## `tests/unit/lib/search/aws/query/queryTransformer.test.ts`

**Why test this:** The most complex business logic in the codebase — translates URL search parameters into OpenSearch query DSL. Bugs here produce wrong search results silently: a broken filter mapping returns too many results, a broken pagination offset skips records, a broken nested query crashes OpenSearch.

### `oppositeOrderOf()`

Pure helper used when building multi-field program-level sort (primary order ascending, secondary score descending, or vice versa).

| Test | Purpose |
|------|---------|
| returns DESCENDING for ASCENDING | Core contract |
| returns ASCENDING for DESCENDING | Inverse is symmetric |

### `ActivityQueryTransformer.transform()`

| Test | Purpose |
|------|---------|
| returns match_all when there is no term and no filters | No constraints → return everything |
| uses the activity index name for the given locale | Wrong index = querying the wrong data entirely |
| sets size and from from limit and page | Pagination offset: page 2, limit 10 → from=20 |
| adds a query_string clause when a search term is provided | Term triggers full-text search across name/description/timeRange |
| maps badgeFamily filter ID to name and builds a terms clause | Filter IDs are resolved to names before sending to OpenSearch |
| maps programLevel filter ID to name and builds a nested clause | Program levels are stored as nested objects — requires `nested` query type |
| maps theme filter ID to name and builds a terms clause | Theme uses flat `terms` (not nested) |
| excludes a filter whose ID is not in the filter model | Unknown IDs are silently dropped; unknown-only filters fall back to match_all |
| sorts by name.keyword for title sort | OpenSearch requires `.keyword` sub-field for sorting strings |

### `BadgeQueryTransformer.transform()`

| Test | Purpose |
|------|---------|
| uses the badge index name for the given locale | Separate index per content type and locale |
| returns match_all when there is no term and no filters | Same baseline as activity |
| maps badgeFamily filter to the "family" field (not "badgeFamilies") | Badge schema uses singular `family` — different from activity's `badgeFamilies` |
| maps programLevel filter to the "programLevel" nested path (not "programLevels") | Badge uses singular `programLevel` path — different from activity's `programLevels` |

---

## `tests/unit/utils/activityUtils.test.ts`

**Why test this:** Four transformation functions that map raw AEM API responses into React component props. The data shapes differ significantly from the component prop shapes, so these functions contain real mapping logic with branching (hasAllLevels, deduplication, AEM vs external URL selection).

### `createRelatedBadges()`

| Test | Purpose |
|------|---------|
| returns empty array when given empty badges array | No badges → no output |
| maps badge fields to RelatedBadgeProps shape | All identity fields are preserved |
| builds image URL by prepending envUrl and stripping leading slash | Validates the `buildImagePath` logic |
| resolves programLevel.id by looking up name in aemProgramLevels | Level lookup must match by `name` |
| uses empty string for theme when badge theme is absent | Optional field must default to `''`, not throw |

### `createSupplies()`

| Test | Purpose |
|------|---------|
| returns empty array when activity has no materials | No materials → empty output |
| maps each material to a supply with translated unit | Unit string is passed through the translate function |
| sets unit to undefined when material has no unit | Falsy unit → no translation call, value stays undefined |
| preserves all material fields on the returned supply | Spread of original material must not drop fields |

### `createHandouts()`

| Test | Purpose |
|------|---------|
| returns undefined when activity has no relatedResources | Optional chain — must not throw |
| maps a resource with a file path to a handout using the AEM URL | AEM path takes precedence over external URL |
| uses external URL for link when resource has no file path | Falls back to raw URL when path is absent |
| deduplicates resources with the same file URL | Duplicate URLs are filtered out; first occurrence wins |
| keeps resources with distinct file URLs | Non-duplicates must all be included |

### `mapActivityData()`

| Test | Purpose |
|------|---------|
| maps basic activity fields | name, timeRange, description pass through unchanged |
| sets hasAllLevels true when activity program levels match all AEM levels | Count comparison determines "all levels" flag |
| sets hasAllLevels false when activity has fewer program levels than AEM total | Fewer levels → flag must be false |
| assigns ProgramLevelIds.ALL to all tags when hasAllLevels is true | All-levels activities show the "ALL" badge id |
| resolves tag id from aemProgramLevels when single level | Level id is looked up from AEM data, not hardcoded |
| returns empty tags array when activity has no programLevel | Absent field must yield empty array, not throw |
