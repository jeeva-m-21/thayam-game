import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../state/gameStore';
import { soundManager } from '../utils/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'rules' | 'hotkeys' | 'audio'>('rules');
  const { isMuted, toggleMute, volume, setVolume } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-ink/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-floor-oxide border-2 border-brass-bright rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kolam-chalk/15 bg-stone-ink/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-display font-bold text-brass-bright">
              How to Play & Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-kolam-chalk/10 hover:bg-kolam-chalk/20 text-kolam-chalk flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-kolam-chalk/10 bg-stone-ink/30 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('rules')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              tab === 'rules'
                ? 'border-brass-bright text-brass-bright'
                : 'border-transparent text-kolam-chalk/50 hover:text-kolam-chalk/80'
            }`}
          >
            📖 Sacred Rules
          </button>
          <button
            onClick={() => setTab('hotkeys')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              tab === 'hotkeys'
                ? 'border-brass-bright text-brass-bright'
                : 'border-transparent text-kolam-chalk/50 hover:text-kolam-chalk/80'
            }`}
          >
            ⌨️ Hotkeys
          </button>
          <button
            onClick={() => setTab('audio')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              tab === 'audio'
                ? 'border-brass-bright text-brass-bright'
                : 'border-transparent text-kolam-chalk/50 hover:text-kolam-chalk/80'
            }`}
          >
            🔊 Sound & Audio
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs text-kolam-chalk/90 leading-relaxed">
          {tab === 'rules' ? (
            <>
              <div className="p-3.5 rounded-xl bg-stone-ink/60 border border-brass/30 flex flex-col gap-1.5">
                <span className="font-bold text-brass-bright flex items-center gap-1.5 text-sm">
                  <span>✨</span> 1. Entering the Board (தாயம்)
                </span>
                <p>
                  All 4 pawns start in your off-board Reserve. A pawn can only enter the board on your Entry Square when you roll a <strong>1 (Thayam / தாயம்)</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-ink/60 border border-brass/30 flex flex-col gap-1.5">
                <span className="font-bold text-brass-bright flex items-center gap-1.5 text-sm">
                  <span>⚡</span> 2. Cutting Opponents (வெட்டு) & Inner Path
                </span>
                <p>
                  Landing on an opponent's pawn on any non-safe square <strong>cuts</strong> it, banishing it back to their reserve. You MUST cut at least 1 opponent pawn during the match to unlock the inner path leading to victory!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-ink/60 border border-brass/30 flex flex-col gap-1.5">
                <span className="font-bold text-brass-bright flex items-center gap-1.5 text-sm">
                  <span>✕</span> 3. Safe Sanctuaries (மலக்கு)
                </span>
                <p>
                  The 8 squares marked with crosses (including each player's home square) are <strong>Safe Spots (மலக்கு)</strong>. Pawns resting here are immune to cuts and multiple pawns may coexist peacefully.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-ink/60 border border-brass/30 flex flex-col gap-1.5">
                <span className="font-bold text-brass-bright flex items-center gap-1.5 text-sm">
                  <span>🌟</span> 4. Bonus Rolls (கூடுதல் உருட்டல்)
                </span>
                <p>
                  Rolling <strong>1 (தாயம்), 5 (ஐந்து), 6 (ஆறு), or 12 (பன்னிரண்டு)</strong> earns a <strong>Bonus Roll</strong>! You move your pawn first, then immediately cast the dice again.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-ink/60 border border-brass/30 flex flex-col gap-1.5">
                <span className="font-bold text-brass-bright flex items-center gap-1.5 text-sm">
                  <span>🏆</span> 5. Winning the Game (முற்றம்)
                </span>
                <p>
                  The first player to march all 4 of their pawns into the sacred <strong>Center Sanctuary (முற்றம்)</strong> with exact dice rolls wins the championship!
                </p>
              </div>
            </>
          ) : tab === 'hotkeys' ? (
            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <span>Roll Dice / Quick Enter Pawn:</span>
                <span className="px-2 py-1 rounded bg-kolam-chalk/20 font-mono font-bold text-brass-bright">
                  Space / Enter
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <span>Select / Move Pawn 1, 2, 3, 4:</span>
                <span className="px-2 py-1 rounded bg-kolam-chalk/20 font-mono font-bold text-brass-bright">
                  Keys 1 - 4
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <span>Open Rules & Help Guide:</span>
                <span className="px-2 py-1 rounded bg-kolam-chalk/20 font-mono font-bold text-brass-bright">
                  H or ?
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <span>Open Match Analytics & Statistics:</span>
                <span className="px-2 py-1 rounded bg-kolam-chalk/20 font-mono font-bold text-brass-bright">
                  S
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <span>Mute / Unmute Sound Effects:</span>
                <span className="px-2 py-1 rounded bg-kolam-chalk/20 font-mono font-bold text-brass-bright">
                  M
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <span>Switch Language (EN / தமிழ்):</span>
                <span className="px-2 py-1 rounded bg-kolam-chalk/20 font-mono font-bold text-brass-bright">
                  L
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Volume Slider Card */}
              <div className="p-4 rounded-2xl bg-stone-ink/60 border border-brass/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brass-bright text-sm flex items-center gap-1.5">
                    <span>🎚️</span> Master Sound Volume
                  </span>
                  <span className="font-mono text-xs font-bold text-brass-bright bg-stone-ink/80 px-2 py-0.5 rounded-lg border border-kolam-chalk/20">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="w-full accent-brass-bright cursor-pointer"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-kolam-chalk/50">Mute (0%)</span>
                  <span className="text-[10px] text-kolam-chalk/50">Max (100%)</span>
                </div>
              </div>

              {/* Mute Toggle */}
              <div className="p-3.5 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-kolam-chalk">Sound Effects Audio</span>
                  <span className="text-[10px] text-kolam-chalk/60">Toggle game sound & temple bells</span>
                </div>
                <button
                  onClick={toggleMute}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                    isMuted
                      ? 'bg-crimson/20 border-crimson text-crimson'
                      : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  }`}
                >
                  {isMuted ? '🔇 Muted' : '🔊 Active'}
                </button>
              </div>

              {/* Sound Preview Test Buttons */}
              <div className="flex flex-col gap-2">
                <span className="font-bold text-brass-bright text-xs tracking-wider uppercase">
                  🎧 Test Sound Design (Synthesized Audio API)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => soundManager.playDiceRoll()}
                    className="p-2.5 rounded-xl bg-stone-ink/70 hover:bg-stone-ink border border-kolam-chalk/20 hover:border-brass-bright text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>🎲</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-kolam-chalk text-[11px]">Dice Clack</span>
                      <span className="text-[9px] text-kolam-chalk/50">Metallic roll</span>
                    </div>
                  </button>

                  <button
                    onClick={() => soundManager.playPawnMove()}
                    className="p-2.5 rounded-xl bg-stone-ink/70 hover:bg-stone-ink border border-kolam-chalk/20 hover:border-brass-bright text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>♟️</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-kolam-chalk text-[11px]">Pawn Hop</span>
                      <span className="text-[9px] text-kolam-chalk/50">Wood placement</span>
                    </div>
                  </button>

                  <button
                    onClick={() => soundManager.playCut()}
                    className="p-2.5 rounded-xl bg-stone-ink/70 hover:bg-stone-ink border border-kolam-chalk/20 hover:border-brass-bright text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>⚡</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-kolam-chalk text-[11px]">Vettu Strike</span>
                      <span className="text-[9px] text-kolam-chalk/50">Sharp clack impact</span>
                    </div>
                  </button>

                  <button
                    onClick={() => soundManager.playBonusRoll(1)}
                    className="p-2.5 rounded-xl bg-stone-ink/70 hover:bg-stone-ink border border-kolam-chalk/20 hover:border-brass-bright text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>🔔</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-kolam-chalk text-[11px]">Thayam Bell</span>
                      <span className="text-[9px] text-kolam-chalk/50">Bronze bell chime</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-kolam-chalk/15 bg-stone-ink/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brass text-stone-ink font-bold text-xs rounded-xl shadow hover:brightness-110 active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
