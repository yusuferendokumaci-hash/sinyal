'use client';

import { Locale, t } from '@/lib/i18n';
import { Activity } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function Header({ locale, onLocaleChange }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <Activity className="w-5 h-5 text-background" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gold rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-accent-light to-gold-light bg-clip-text text-transparent">
              {t(locale, 'siteName')}
            </h1>
            <p className="text-[10px] text-muted tracking-wide uppercase">
              {t(locale, 'siteSlogan')}
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>
      </div>
    </header>
  );
}
