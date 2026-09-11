import React from 'react';
import { useGameStore } from '../state/gameStore';
import { useTranslation } from 'react-i18next';
import { OFF_BOARD, isAtCenter, legalMoves } from '@thayam/rules-engine';

const COLOR_MAP = {
  red: '#B2312F',
  green: '#4B7A46',
  yellow: '#D9A22A',
  blue: '#2E4C74',
};

export const DiceControls: React.FC = () => {
  const { gameState, rollCurrentPlayer, selectedPawnId, selectPawn, makeMove, isAiThinking } = useGameStore();
  const { t } = useTranslation();

  const activeColor = gameState.turnOrder[gameState.currentPlayerIndex];
  const activePlayer = gameState.players[activeColor];
  const path = gameState.board.players[activeColor];

  const currentLegalMoves = gameState.currentRoll && gameState.phase === 'waiting-for-move'
    ? legalMoves(gameState, gameState.currentRoll.value)
    : [];

  const availablePawnIds = new Set(currentLegalMoves.map(m => m.pawnId));

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[480px] bg-stone-ink/80 backdrop-blur-sm p-4 rounded-2xl border border-kolam-chalk/20 shadow-xl">
      {/* Status Bar */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full shadow"
            style={{ backgroundColor: COLOR_MAP[activeColor] }}
          />
          <span className="font-bold text-sm uppercase tracking-wider">
            {t(`player.${activeColor}`)}'s turn
          </span>
        </div>

        <div className="text-xs px-2.5 py-1 rounded-full bg-brass/20 text-brass-bright border border-brass/40">
          {activePlayer.hasCutOpponent ? t('rules.inner_unlocked') : t('rules.inner_locked')}
        </div>
      </div>

      {/* Dice & Roll Button */}
      <div className="flex items-center justify-center gap-6 my-1">
        {gameState.currentRoll ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 rounded-lg bg-kolam-chalk text-stone-ink font-mono font-bold text-2xl flex items-center justify-center shadow-inner border-2 border-brass">
              {gameState.currentRoll.dieA}
            </div>
            <div className="w-12 h-16 rounded-lg bg-kolam-chalk text-stone-ink font-mono font-bold text-2xl flex items-center justify-center shadow-inner border-2 border-brass">
              {gameState.currentRoll.dieB}
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-xs text-kolam-chalk/60 uppercase">{t('game.roll')}</span>
              <span className="text-3xl font-display font-bold text-brass-bright">
                {gameState.currentRoll.value}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-kolam-chalk/50 italic py-3">
            {isAiThinking ? 'AI thinking...' : 'Roll the Daayam dice'}
          </div>
        )}
      </div>

      {/* Roll Action Button */}
      {gameState.phase === 'waiting-for-roll' && (
        <button
          onClick={rollCurrentPlayer}
          disabled={isAiThinking}
          className="w-full py-3.5 bg-gradient-to-r from-brass to-brass-bright text-stone-ink font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 text-base tracking-wider uppercase font-display"
        >
          {t('game.roll')}
        </button>
      )}

      {/* Pawn Tray (Off-board pawns) */}
      <div className="w-full flex flex-col gap-1.5 pt-2 border-t border-kolam-chalk/10">
        <span className="text-[11px] text-kolam-chalk/60 uppercase tracking-wider">
          {t('game.pawns')} ({activeColor})
        </span>
        <div className="grid grid-cols-4 gap-2">
          {activePlayer.pawns.map((pawn) => {
            const canMove = availablePawnIds.has(pawn.id);
            const isSelected = selectedPawnId === pawn.id;
            const atCenter = isAtCenter(pawn.position, path);
            const isOffBoard = pawn.position === OFF_BOARD;

            return (
              <button
                key={pawn.id}
                onClick={() => {
                  if (canMove) {
                    // If this pawn has exactly 1 legal move, make it directly on click
                    const moves = currentLegalMoves.filter(m => m.pawnId === pawn.id);
                    if (moves.length === 1) {
                      makeMove(moves[0]);
                    } else {
                      selectPawn(isSelected ? null : pawn.id);
                    }
                  }
                }}
                disabled={!canMove}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                  isSelected
                    ? 'border-brass-bright bg-brass/30 ring-2 ring-brass-bright scale-105'
                    : canMove
                    ? 'border-kolam-chalk/40 bg-kolam-chalk/10 hover:bg-kolam-chalk/20 cursor-pointer animate-pulse'
                    : 'border-transparent bg-stone-ink/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow"
                  style={{ backgroundColor: COLOR_MAP[activeColor] }}
                >
                  {pawn.id + 1}
                </div>
                <span className="text-[10px] text-kolam-chalk/70">
                  {atCenter ? 'Center 🏆' : isOffBoard ? 'Off-board' : `Pos ${pawn.position}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
