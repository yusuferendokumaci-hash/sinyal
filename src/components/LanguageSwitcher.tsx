'use client';

import { Locale } from '@/lib/i18n';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-full p-0.5">
      <button
        onClick={() => onChange('tr')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          locale === 'tr'
            ? 'bg-accent text-background'
            : 'text-muted hover:text-foreground'
        }`}
      >
        <span>TR</span>
      </button>
      <button
        onClick={() => onChange('en')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          locale === 'en'
            ? 'bg-accent text-background'
            : 'text-muted hover:text-foreground'
        }`}
      >
        <span>EN</span>
      </button>
    </div>
  );
}
