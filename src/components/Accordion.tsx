'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({ icon, title, badge, badgeColor = 'bg-accent/15 text-accent', defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`bg-card border rounded-2xl transition-all duration-300 ${open ? 'border-accent/30' : 'border-border hover:border-border'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${open ? 'bg-accent/15' : 'bg-surface'}`}>
            {icon}
          </div>
          <span className="text-base font-bold">{title}</span>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${open ? 'rotate-180 text-accent' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 sm:px-5 pb-5 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
