import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';

export const MoveLog: React.FC = () => {
  const { history } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const getEntryBadge = (text: string) => {
    if (text.includes('WINS THE GAME')) {
      return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">🏆 WIN</span>;
    }
    if (text.includes('cut') || text.includes('⚡')) {
      return <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px]">⚡ VETTU</span>;
    }
    if (text.includes('BONUS ROLL')) {
      return <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">🌟 BONUS</span>;
    }
    if (text.includes('rolled')) {
      return <span className="px-1.5 py-0.5 rounded bg-kolam-chalk/10 text-kolam-chalk/70 font-mono text-[10px]">🎲 ROLL</span>;
    }
    if (text.includes('moved')) {
      return <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">♟ MOVE</span>;
    }
    return <span className="px-1.5 py-0.5 rounded bg-stone-ink/40 text-kolam-chalk/50 text-[10px]">INFO</span>;
  };

  return (
    <div className="w-full bg-stone-ink/70 border border-kolam-chalk/15 rounded-xl p-3 shadow-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-brass-bright uppercase tracking-wider">
            Match Chronicle
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-kolam-chalk/10 text-kolam-chalk/60 font-mono">
            {history.length} turns
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-semibold text-brass hover:text-brass-bright underline transition-colors"
        >
          {isExpanded ? 'Collapse ▲' : 'Expand All ▼'}
        </button>
      </div>

      {/* Log entries */}
      <div
        role="log"
        aria-live="polite"
        aria-atomic="false"
        className={`flex flex-col gap-1.5 overflow-y-auto transition-all ${
          isExpanded ? 'max-h-60' : 'max-h-24'
        }`}
      >
        {history.length === 0 ? (
          <span className="text-xs text-kolam-chalk/40 italic">No turns logged yet.</span>
        ) : (
          history.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-kolam-chalk/90 font-mono bg-stone-ink/40 px-2 py-1 rounded border border-kolam-chalk/5 hover:border-kolam-chalk/15 transition-all"
            >
              {getEntryBadge(entry)}
              <span className="leading-tight flex-1 truncate">{entry}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
