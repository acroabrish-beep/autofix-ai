/**
 * Translation namespaces for the authenticated application pages.
 *
 * Each namespace is a flat key/value map so it can be merged into i18next
 * resources alongside the shared shell translations in `src/lib/i18n.ts`.
 */
export type AppPageTranslations = {
  shared: Record<string, string>;
  auth: Record<string, string>;
  settings: Record<string, string>;
  search: Record<string, string>;
  history: Record<string, string>;
  learning: Record<string, string>;
  repairs: Record<string, string>;
  vehicles: Record<string, string>;
  diagnostics_result: Record<string, string>;
  reminders: Record<string, string>;
  lab: Record<string, string>;
  extras: Record<string, string>;
};
