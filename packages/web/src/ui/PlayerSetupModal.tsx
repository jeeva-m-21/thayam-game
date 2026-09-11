import React, { useState } from 'react';
import { PlayerColor } from '@thayam/rules-engine';
import { useGameStore, GameMode } from '../state/gameStore';

interface PlayerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerConfig {
  color: PlayerColor;
  label: string;
  tamilLabel: string;
  cardColor: string;
  badgeBg: string;
  direction: string;
}

const ALL_PLAYERS: PlayerConfig[] = [
  {
    color: 'red',
    label: 'Red (South)',
    tamilLabel: 'தெற்கு (செம்பருத்தி)',
    cardColor: 'border-crimson/60 bg-crimson/10 text-crimson-bright',
    badgeBg: 'bg-crimson text-white',
    direction: 'South Entry',
  },
  {
    color: 'green',
    label: 'Green (North)',
    tamilLabel: 'வடக்கு (மரகதம்)',
    cardColor: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400',
    badgeBg: 'bg-emerald-600 text-white',
    direction: 'North Entry',
  },
  {
    color: 'blue',
    label: 'Blue (East)',
    tamilLabel: 'கிழக்கு (நீலம்)',
    cardColor: 'border-blue-500/60 bg-blue-500/10 text-blue-400',
    badgeBg: 'bg-blue-600 text-white',
    direction: 'East Entry',
  },
  {
    color: 'yellow',
    label: 'Yellow (West)',
    tamilLabel: 'மேற்கு (மஞ்சள்)',
    cardColor: 'border-amber-400/60 bg-amber-400/10 text-amber-300',
    badgeBg: 'bg-amber-500 text-stone-ink',
    direction: 'West Entry',
  },
];

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({ isOpen, onClose }) => {
  const { resetGame, setMode, setAiDifficulty, aiDifficulty, showToast } = useGameStore();

  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [selectedColors, setSelectedColors] = useState<PlayerColor[]>(['red', 'green']);
  const [gameType, setGameType] = useState<GameMode>('local');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(aiDifficulty);

  if (!isOpen) return null;

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    setPlayerCount(count);
    if (count === 2) {
      setSelectedColors(['red', 'green']);
    } else if (count === 3) {
      setSelectedColors(['red', 'green', 'blue']);
    } else {
      setSelectedColors(['red', 'green', 'blue', 'yellow']);
    }
  };

  const toggleColor = (color: PlayerColor) => {
    if (selectedColors.includes(color)) {
      if (selectedColors.length <= 2) {
        showToast('At least 2 players are required for Thayam!');
        return;
      }
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      if (selectedColors.length >= 4) {
        showToast('Maximum 4 players allowed on a 7x7 board.');
        return;
      }
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleStartGame = () => {
    setMode(gameType);
    if (gameType === 'vs-ai') {
      setAiDifficulty(difficulty);
    }
    resetGame(selectedColors);
    showToast(`New ${selectedColors.length}-player match started!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-ink/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-floor-oxide border-2 border-brass-bright rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kolam-chalk/15 bg-stone-ink/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <h2 className="text-lg font-display font-bold text-brass-bright">
              Match Setup & Players (ஆட்ட அமைப்பு)
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
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs text-kolam-chalk/90">
          {/* Game Mode */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-brass-bright uppercase tracking-wider text-[11px]">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameType('local')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  gameType === 'local'
                    ? 'border-brass-bright bg-brass/20 text-brass-bright shadow-md'
                    : 'border-kolam-chalk/15 bg-stone-ink/40 text-kolam-chalk/70 hover:border-kolam-chalk/40'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>👥</span> Pass & Play
                </div>
                <span className="text-[10px] opacity-75">
                  Play locally with friends on this device
                </span>
              </button>

              <button
                type="button"
                onClick={() => setGameType('vs-ai')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  gameType === 'vs-ai'
                    ? 'border-brass-bright bg-brass/20 text-brass-bright shadow-md'
                    : 'border-kolam-chalk/15 bg-stone-ink/40 text-kolam-chalk/70 hover:border-kolam-chalk/40'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>🤖</span> Solo vs AI
                </div>
                <span className="text-[10px] opacity-75">
                  Battle tactical AI bots
                </span>
              </button>
            </div>
          </div>

          {/* AI Difficulty if vs-ai */}
          {gameType === 'vs-ai' && (
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-stone-ink/50 border border-kolam-chalk/15">
              <label className="font-bold text-brass-bright text-[11px]">
                Bot Heuristic Intelligence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 px-2 rounded-xl text-center font-bold text-xs capitalize transition-all border ${
                      difficulty === diff
                        ? 'border-brass-bright bg-brass text-stone-ink'
                        : 'border-kolam-chalk/20 bg-stone-ink text-kolam-chalk/60 hover:text-kolam-chalk'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player Count Presets */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-brass-bright uppercase tracking-wider text-[11px]">
              Quick Player Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                    playerCount === count && selectedColors.length === count
                      ? 'border-brass-bright bg-brass/25 text-brass-bright'
                      : 'border-kolam-chalk/15 bg-stone-ink/40 text-kolam-chalk/70 hover:border-kolam-chalk/30'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection & Rotation Order */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-brass-bright uppercase tracking-wider text-[11px]">
                Active Seats ({selectedColors.length}/4)
              </label>
              <span className="text-[10px] text-kolam-chalk/50">Tap card to toggle</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ALL_PLAYERS.map((p) => {
                const isSelected = selectedColors.includes(p.color);
                const seatIndex = selectedColors.indexOf(p.color);

                return (
                  <div
                    key={p.color}
                    onClick={() => toggleColor(p.color)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? `${p.cardColor} ring-1 ring-brass-bright/30`
                        : 'border-kolam-chalk/10 bg-stone-ink/20 opacity-40 grayscale hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{p.label}</span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-brass text-stone-ink font-bold text-[10px] flex items-center justify-center">
                          #{seatIndex + 1}
                        </span>
                      ) : (
                        <span className="text-[10px] text-kolam-chalk/40">OFF</span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-75">{p.tamilLabel}</span>
                    <span className="text-[9px] opacity-60 font-mono">{p.direction}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-kolam-chalk/15 bg-stone-ink/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-kolam-chalk/70 hover:text-kolam-chalk text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleStartGame}
            disabled={selectedColors.length < 2}
            className="px-6 py-2.5 bg-brass hover:bg-brass-bright text-stone-ink font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            Start Match ({selectedColors.length} Players) →
          </button>
        </div>
      </div>
    </div>
  );
};
