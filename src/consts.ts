export const SITE_URL = 'https://healthcalc.ciciad.tech';
export const SITE_NAME = 'HealthCalc';
export const SUPPORTED_LANGS = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'ar'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];
