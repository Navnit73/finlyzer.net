'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

export type Lang = 'de' | 'en';
/** Picks the German or the English variant of a UI string. */
export type T = (de: string, en: string) => string;

const STORAGE_KEY = 'finlyzers-einvoice-lang';

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void; t: T }>({
  lang: 'de',
  setLang: () => {},
  t: (de) => de,
});

/**
 * UI language of the e-invoice tool only. The server always renders German, so crawlers, metadata,
 * canonical and hreflang never change; English is applied on the client after the visitor picks it
 * and is remembered in localStorage. No URL, cookie or translation service is involved.
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'en') setLangState('en');
    } catch {}
  }, []);

  // Screen readers pronounce the visible language; restored to German when leaving the page.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    return () => {
      root.lang = 'de';
    };
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };
  const t: T = (de, en) => (lang === 'en' ? en : de);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

const LANGS: { id: Lang; short: string; name: string }[] = [
  { id: 'de', short: 'DE', name: 'Deutsch' },
  { id: 'en', short: 'EN', name: 'English' },
];

/** DE | EN toggle; each option is labelled in its own language. */
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t('Sprache', 'Language')} className={`inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] p-1 ${className}`}>
      <Languages className="w-4 h-4 mx-1.5 text-[var(--color-text-secondary)]" aria-hidden="true" />
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang === l.id}
          aria-label={l.name}
          title={l.name}
          onClick={() => setLang(l.id)}
          className={`min-h-[32px] min-w-[44px] px-3 rounded-full text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
            lang === l.id ? 'bg-[var(--color-ink)] text-[var(--color-surface)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
