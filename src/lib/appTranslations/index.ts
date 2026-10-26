import { en } from './en';
import { am } from './am';
import { om } from './om';
import { sid } from './sid';
import type { AppPageTranslations } from './types';

export type { AppPageTranslations };

/** Page-level translations keyed by the supported language codes. */
export const APP_TRANSLATIONS: Record<'en' | 'am' | 'om' | 'sid', AppPageTranslations> = {
  en,
  am,
  om,
  sid,
};
