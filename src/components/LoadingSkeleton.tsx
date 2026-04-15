'use client';

export function MatchCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 animate-pulse">
      {/* League + Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-border/50" />
          <div className="w-24 h-3 rounded bg-border/50" />
        </div>
        <div className="w-12 h-3 rounded bg-border/50" />
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-border/50 mb-2" />
          <div className="w-20 h-3 rounded bg-border/50 mb-2" />
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 rounded bg-border/30" />
            ))}
          </div>
        </div>
        <div className="px-4">
          <div className="w-10 h-10 rounded-full bg-border/30" />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-border/50 mb-2" />
          <div className="w-20 h-3 rounded bg-border/50 mb-2" />
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 rounded bg-border/30" />
            ))}
          </div>
        </div>
      </div>

      {/* Prediction area */}
      <div className="border-t border-border pt-3">
        <div className="flex justify-between mb-3">
          <div className="w-20 h-3 rounded bg-border/50" />
          <div className="w-10 h-5 rounded-full bg-border/30" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-border/30" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DailyPickSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-border/50" />
          <div>
            <div className="w-28 h-4 rounded bg-border/50 mb-1" />
            <div className="w-40 h-2 rounded bg-border/30" />
          </div>
        </div>
        <div className="w-14 h-8 rounded bg-border/50" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-border/30 mb-2" />
      ))}
    </div>
  );
}

export function PageLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <div className="text-sm font-bold text-accent tracking-wider">SINYAL</div>
        <div className="text-[10px] text-muted mt-1">Loading matches...</div>
      </div>
    </div>
  );
}
