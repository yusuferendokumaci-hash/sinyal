'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const lightColors = {
  '--color-background': '#f5f7fb',
  '--color-foreground': '#0c1222',
  '--color-card': '#ffffff',
  '--color-card-hover': '#f0f3f9',
  '--color-border': '#dfe4ee',
  '--color-accent': '#00b894',
  '--color-accent-light': '#00d4aa',
  '--color-gold': '#e6a700',
  '--color-gold-light': '#ffb800',
  '--color-danger': '#e74c3c',
  '--color-muted': '#8899aa',
  '--color-surface': '#eef1f7',
};

const darkColors = {
  '--color-background': '#080c14',
  '--color-foreground': '#f0f4fc',
  '--color-card': '#0f1520',
  '--color-card-hover': '#151d2c',
  '--color-border': '#1a2438',
  '--color-accent': '#00d4aa',
  '--color-accent-light': '#33ffd2',
  '--color-gold': '#ffb800',
  '--color-gold-light': '#ffd54f',
  '--color-danger': '#ff4757',
  '--color-muted': '#5a6b85',
  '--color-surface': '#0b1120',
};

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sinyal-theme');
    if (saved === 'light') {
      setDark(false);
      applyTheme(lightColors);
    }
  }, []);

  function applyTheme(colors: Record<string, string>) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      applyTheme(darkColors);
      localStorage.setItem('sinyal-theme', 'dark');
    } else {
      applyTheme(lightColors);
      localStorage.setItem('sinyal-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-accent/40 transition-all duration-300"
      title={dark ? 'Light Mode' : 'Dark Mode'}
    >
      {dark ? <Sun className="w-3.5 h-3.5 text-gold" /> : <Moon className="w-3.5 h-3.5 text-accent" />}
    </button>
  );
}
