import React from 'react';
import { useGameStore } from '../state/gameStore';

export const Toast: React.FC = () => {
  const { toast } = useGameStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-ink/95 border-2 border-brass-bright text-brass-bright text-xs md:text-sm font-semibold shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-2 max-w-sm text-center pointer-events-none">
      <span>🔔</span>
      <span>{toast}</span>
    </div>
  );
};
