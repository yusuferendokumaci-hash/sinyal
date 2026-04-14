'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sinyal-theme');
    if (saved === 'light') {
      setDark(false);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('sinyal-theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('sinyal-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-accent/40 transition-colors"
      title={dark ? 'Light Mode' : 'Dark Mode'}
    >
      {dark ? <Sun className="w-3.5 h-3.5 text-gold" /> : <Moon className="w-3.5 h-3.5 text-accent" />}
    </button>
  );
}
