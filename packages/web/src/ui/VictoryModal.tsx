import React from 'react';
import { useGameStore } from '../state/gameStore';
import { useStatsStore } from '../state/statsStore';
import { useTranslation } from 'react-i18next';
import type { PlayerColor } from '@thayam/rules-engine';

interface VictoryModalProps {
  winner: PlayerColor;
  onRematch: () => void;
  onOpenStats: () => void;
}

const WINNER_THEMES: Record<PlayerColor, { name: string; bg: string; text: string }> = {
  red: { name: 'Red Champion', bg: 'from-red-600/30 to-amber-600/30', text: 'text-red-400' },
  green: { name: 'Green Champion', bg: 'from-emerald-600/30 to-teal-600/30', text: 'text-emerald-400' },
  yellow: { name: 'Yellow Champion', bg: 'from-amber-600/30 to-yellow-600/30', text: 'text-amber-400' },
  blue: { name: 'Blue Champion', bg: 'from-sky-600/30 to-indigo-600/30', text: 'text-sky-400' },
};

export const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onRematch, onOpenStats }) => {
  const { t } = useTranslation();
  const { stats } = useStatsStore();
  const winnerStat = stats[winner];
  const theme = WINNER_THEMES[winner];

  return (
    <div className="fixed inset-0 z-50 bg-stone-ink/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Decorative animated confetti dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce"
            style={{
              top: `${(i * 17) % 90}%`,
              left: `${(i * 23) % 95}%`,
              width: `${(i % 3) * 4 + 6}px`,
              height: `${(i % 3) * 4 + 6}px`,
              backgroundColor: ['#D9A22A', '#B2312F', '#4B7A46', '#2E4C74', '#F4E8D1'][i % 5],
              opacity: 0.7,
              animationDuration: `${1.2 + (i % 5) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-floor-oxide border-2 border-brass-bright p-6 md:p-8 rounded-3xl shadow-2xl text-center max-w-md w-full flex flex-col items-center gap-5 z-10 overflow-hidden">
        {/* Glowing backdrop aura */}
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg} pointer-events-none opacity-40`} />

        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-2xl bg-brass/20 border-2 border-brass-bright flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
          <span className="text-4xl animate-pulse select-none">🏆</span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-brass-bright font-mono">
            Sacred Sanctuary Victor
          </span>
          <h2 className="text-3xl font-display font-black text-brass-bright tracking-wide">
            {winner.toUpperCase()} WINS!
          </h2>
          <p className="text-xs text-kolam-chalk/80 italic max-w-xs mt-1">
            {t('game.won', { player: winner.toUpperCase() })}
          </p>
        </div>

        {/* Winner Achievements Card */}
        <div className="w-full bg-stone-ink/60 border border-kolam-chalk/15 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-kolam-chalk/60 uppercase">Cuts Made</span>
            <span className="text-lg font-bold text-brass-bright">{winnerStat.cutsMade} ⚡</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-kolam-chalk/60 uppercase">Bonus Rolls</span>
            <span className="text-lg font-bold text-emerald-400">{winnerStat.bonusRollsCount} 🌟</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-kolam-chalk/60 uppercase">Marched</span>
            <span className="text-lg font-bold text-kolam-chalk">{winnerStat.totalDistanceMoved} 👣</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <button
            onClick={onOpenStats}
            className="flex-1 py-2.5 px-4 rounded-xl border border-kolam-chalk/25 text-kolam-chalk text-xs font-bold hover:bg-kolam-chalk/10 transition-colors"
          >
            📊 {t('stats.title')}
          </button>
          <button
            onClick={onRematch}
            className="flex-1 py-2.5 px-4 bg-brass-bright text-stone-ink font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            🔄 {t('game.rematch')}
          </button>
        </div>
      </div>
    </div>
  );
};
