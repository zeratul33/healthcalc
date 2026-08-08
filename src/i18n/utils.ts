import type { SupportedLang } from '@/consts';

// Cache for loaded translations
const cache: Record<string, Record<string, unknown>> = {};

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : path;
}

export function useTranslations(dict: Record<string, unknown>) {
  return function t(key: string): string {
    return getNestedValue(dict, key);
  };
}

// Synchronous - use with statically imported JSON
export function makeTranslator(dict: Record<string, unknown>) {
  return (key: string): string => getNestedValue(dict, key);
}
