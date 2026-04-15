'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const lightVars: Record<string, string> = {
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

const darkVars: Record<string, string> = {
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

function applyColors(vars: Record<string, string>) {
  // Force override by setting on both html and body
  const els = [document.documentElement, document.body];
  els.forEach(el => {
    Object.entries(vars).forEach(([key, value]) => {
      el.style.setProperty(key, value, 'important');
    });
  });
  // Also update body background directly
  document.body.style.background = vars['--color-background'];
  document.body.style.color = vars['--color-foreground'];
}

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sinyal-theme');
    if (saved === 'light') {
      setDark(false);
      applyColors(lightVars);
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    applyColors(next ? darkVars : lightVars);
    localStorage.setItem('sinyal-theme', next ? 'dark' : 'light');
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
