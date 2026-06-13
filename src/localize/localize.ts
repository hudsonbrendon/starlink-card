import type { HomeAssistant } from 'custom-card-helpers';
import en from './languages/en.json';
import ptBR from './languages/pt-BR.json';

type Dict = Record<string, unknown>;

const LANGUAGES: Record<string, Dict> = {
  en,
  pt: ptBR,
  'pt-BR': ptBR,
};

function lookup(dict: Dict | undefined, key: string): string | undefined {
  const v = key.split('.').reduce<unknown>((o, k) => {
    if (o && typeof o === 'object') return (o as Dict)[k];
    return undefined;
  }, dict);
  return typeof v === 'string' ? v : undefined;
}

export function localize(key: string, hass?: HomeAssistant): string {
  const lang = hass?.locale?.language || hass?.language || 'en';
  const dict = LANGUAGES[lang] || LANGUAGES[lang.split('-')[0]] || en;
  return lookup(dict, key) ?? lookup(en, key) ?? key;
}
