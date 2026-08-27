/**
 * Lightweight signature for the i18next `t` function used across the app.
 *
 * Mirrors the call shape we actually use — a key plus an optional bag of
 * interpolation values. Avoids importing i18next's full `TFunction` generic
 * machinery just to type a parameter.
 */
export type TranslateFn = (key: string, options?: Record<string, string | number>) => string;
