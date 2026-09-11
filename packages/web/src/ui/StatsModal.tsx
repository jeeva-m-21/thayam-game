import React from 'react';
import { useStatsStore } from '../state/statsStore';
import { useGameStore } from '../state/gameStore';
import type { PlayerColor } from '@thayam/rules-engine';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_STYLES: Record<PlayerColor, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-600/40' },
  green: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-600/40' },
  yellow: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-600/40' },
  blue: { bg: 'bg-sky-950/60', text: 'text-sky-400', border: 'border-sky-600/40' },
};

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { stats } = useStatsStore();
  const { gameState } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-floor-oxide border-2 border-brass-bright rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kolam-chalk/15 bg-stone-ink/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-lg font-display font-bold text-brass-bright">
              Match Statistics & Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-kolam-chalk/10 hover:bg-kolam-chalk/20 text-kolam-chalk flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {gameState.turnOrder.map((color) => {
            const playerStat = stats[color];
            const pStyle = COLOR_STYLES[color];

            return (
              <div
                key={color}
                className={`p-4 rounded-xl border ${pStyle.border} ${pStyle.bg} flex flex-col gap-3 shadow-md`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-kolam-chalk/10">
                  <span className={`font-display font-bold uppercase tracking-wider text-sm ${pStyle.text}`}>
                    {color} Player
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-kolam-chalk/10 text-kolam-chalk/80 font-mono">
                    {gameState.players[color].hasCutOpponent ? '🔓 Inner Unlocked' : '🔒 Inner Locked'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-ink/40 p-2 rounded-lg">
                    <span className="text-kolam-chalk/60 block text-[10px] uppercase">Cuts Made</span>
                    <span className="text-base font-bold text-brass-bright">{playerStat.cutsMade}</span>
                  </div>
                  <div className="bg-stone-ink/40 p-2 rounded-lg">
                    <span className="text-kolam-chalk/60 block text-[10px] uppercase">Times Cut</span>
                    <span className="text-base font-bold text-red-400">{playerStat.pawnsCut}</span>
                  </div>
                  <div className="bg-stone-ink/40 p-2 rounded-lg">
                    <span className="text-kolam-chalk/60 block text-[10px] uppercase">Bonus Rolls</span>
                    <span className="text-base font-bold text-emerald-400">{playerStat.bonusRollsCount}</span>
                  </div>
                  <div className="bg-stone-ink/40 p-2 rounded-lg">
                    <span className="text-kolam-chalk/60 block text-[10px] uppercase">Total Rolls</span>
                    <span className="text-base font-bold text-kolam-chalk">{playerStat.totalRollsCount}</span>
                  </div>
                </div>

                <div className="bg-stone-ink/40 p-2 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-kolam-chalk/70">Distance Traveled:</span>
                  <span className="font-mono font-bold text-brass">{playerStat.totalDistanceMoved} spaces</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-kolam-chalk/15 bg-stone-ink/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brass text-stone-ink font-bold text-xs rounded-xl shadow hover:brightness-110 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
