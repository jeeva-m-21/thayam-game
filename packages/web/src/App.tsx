import React, { useState } from 'react';
import { Board2D } from './ui/Board2D';
import { Scene3D } from './scenes/Scene3D';
import { DiceControls } from './ui/DiceControls';
import { useGameStore } from './state/gameStore';
import { useTranslation } from 'react-i18next';

export const App: React.FC = () => {
  const { mode, setMode, resetGame, gameState, history, aiDifficulty, setAiDifficulty } = useGameStore();
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between w-full max-w-[480px] md:max-w-4xl py-2 gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-brass-bright tracking-wide">
            Thayam: Veera Daayam
          </h1>
          <span className="text-xs px-2 py-0.5 rounded bg-kolam-chalk/10 text-kolam-chalk/60 font-mono">
            Classic 7×7
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tier Switch (3D vs 2D fallback per design.md §5.5) */}
          <div className="flex bg-stone-ink/60 p-1 rounded-xl border border-kolam-chalk/15">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d' ? 'bg-brass text-stone-ink shadow' : 'text-kolam-chalk/70'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '2d' ? 'bg-brass text-stone-ink shadow' : 'text-kolam-chalk/70'
              }`}
            >
              2D
            </button>
          </div>

          {/* Mode Switch */}
          <div className="flex bg-stone-ink/60 p-1 rounded-xl border border-kolam-chalk/15">
            <button
              onClick={() => setMode('vs-ai')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'vs-ai' ? 'bg-brass text-stone-ink shadow' : 'text-kolam-chalk/70'
              }`}
            >
              {t('menu.vs_ai')}
            </button>
            <button
              onClick={() => setMode('local')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'local' ? 'bg-brass text-stone-ink shadow' : 'text-kolam-chalk/70'
              }`}
            >
              {t('menu.pass_and_play')}
            </button>
          </div>

          {/* AI Difficulty Selector */}
          {mode === 'vs-ai' && (
            <div className="flex bg-stone-ink/60 p-1 rounded-xl border border-kolam-chalk/15 text-xs">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setAiDifficulty(diff)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    aiDifficulty === diff
                      ? 'bg-kolam-chalk/20 text-brass-bright shadow'
                      : 'text-kolam-chalk/50 hover:text-kolam-chalk/80'
                  }`}
                  title={`AI Difficulty: ${diff}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          )}

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-xs rounded-xl bg-kolam-chalk/10 hover:bg-kolam-chalk/20 border border-kolam-chalk/20 font-bold tracking-wider"
          >
            {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex flex-col md:flex-row items-center justify-center gap-6 w-full flex-1 my-2">
        {viewMode === '3d' ? <Scene3D /> : <Board2D />}

        <div className="flex flex-col gap-4 w-full max-w-[480px]">
          <DiceControls />

          {/* Event Log */}
          <div className="w-full bg-stone-ink/60 border border-kolam-chalk/15 rounded-xl p-3 max-h-28 overflow-y-auto">
            <span className="text-[10px] text-kolam-chalk/50 uppercase tracking-widest block mb-1">
              Match Log
            </span>
            <div className="flex flex-col gap-1 text-xs text-kolam-chalk/80 font-mono">
              {history.slice(0, 4).map((h, i) => (
                <div key={i} className="leading-tight">
                  • {h}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Winner Modal */}
      {gameState.winner && (
        <div className="fixed inset-0 z-50 bg-stone-ink/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-floor-oxide border-2 border-brass-bright p-6 rounded-2xl shadow-2xl text-center max-w-sm flex flex-col items-center gap-4">
            <span className="text-4xl">🏆</span>
            <h2 className="text-2xl font-display font-bold text-brass-bright">
              {gameState.winner.toUpperCase()} WINS!
            </h2>
            <p className="text-sm text-kolam-chalk/80">
              All 4 pawns reached the sacred center sanctuary.
            </p>
            <button
              onClick={() => resetGame()}
              className="px-6 py-2.5 bg-brass-bright text-stone-ink font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
