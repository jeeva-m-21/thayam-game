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

  // Keyboard accessibility & quick flow
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input field (e.g. room code)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState.phase === 'waiting-for-roll' && !isAiThinking) {
          rollCurrentPlayer();
        } else if (gameState.phase === 'waiting-for-move' && currentLegalMoves.length > 0) {
          // If 1-click entry is available, trigger it; else if 1 move exists, trigger it
          const entryMove = currentLegalMoves.find(
            (m) => activePlayer.pawns.find((p) => p.id === m.pawnId)?.position === OFF_BOARD
          );
          if (entryMove) {
            makeMove(entryMove);
          } else if (currentLegalMoves.length === 1) {
            makeMove(currentLegalMoves[0]);
          }
        }
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const pawnId = parseInt(e.key, 10) - 1;
        if (availablePawnIds.has(pawnId)) {
          const moves = currentLegalMoves.filter((m) => m.pawnId === pawnId);
          if (moves.length === 1) {
            makeMove(moves[0]);
          } else {
            selectPawn(selectedPawnId === pawnId ? null : pawnId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState.phase,
    isAiThinking,
    rollCurrentPlayer,
    currentLegalMoves,
    activePlayer,
    makeMove,
    availablePawnIds,
    selectPawn,
    selectedPawnId,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[480px] bg-stone-ink/80 backdrop-blur-sm p-4 rounded-2xl border border-kolam-chalk/20 shadow-xl" role="region" aria-label="Dice and move controls">
      {/* Screen reader live region for game state announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {gameState.phase === 'waiting-for-roll'
          ? `${activeColor} player turn. Press Space or click Roll to cast dice.`
          : gameState.currentRoll
          ? `${activeColor} rolled ${gameState.currentRoll.value}. ${currentLegalMoves.length} moves available.`
          : ''}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full shadow"
            style={{ backgroundColor: COLOR_MAP[activeColor] }}
            aria-hidden="true"
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

      {/* Guidance Banner */}
      <div className="w-full py-2 px-3 rounded-xl bg-stone-ink/60 border border-kolam-chalk/15 text-center text-xs">
        {gameState.phase === 'waiting-for-roll' ? (
          <span className="text-brass-bright font-medium">🎲 Click ROLL or press Spacebar to cast dice</span>
        ) : gameState.currentRoll?.value === 1 ? (
          <span className="text-amber-300 font-bold animate-pulse">
            ✨ THAYAM (தாயம்)! Place a reserve pawn onto the board or advance!
          </span>
        ) : gameState.currentRoll?.value === 5 ||
          gameState.currentRoll?.value === 6 ||
          gameState.currentRoll?.value === 12 ? (
          <span className="text-emerald-400 font-bold">
            🌟 BONUS ROLL ({gameState.currentRoll?.value})! Move your pawn, then roll again.
          </span>
        ) : (
          <span className="text-kolam-chalk/90">
            👉 Advance a pawn by {gameState.currentRoll?.value} spaces
          </span>
        )}
      </div>

      {/* Roll Action Button */}
      {gameState.phase === 'waiting-for-roll' && (
        <button
          onClick={rollCurrentPlayer}
          disabled={isAiThinking}
          aria-label={`${t('game.roll')} for ${activeColor}`}
          className="w-full py-3.5 bg-gradient-to-r from-brass to-brass-bright text-stone-ink font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 text-base tracking-wider uppercase font-display flex items-center justify-center gap-2"
        >
          <span>🎲</span>
          <span>{t('game.roll')}</span>
        </button>
      )}

      {/* Interactive Move Action Panel */}
      {gameState.phase === 'waiting-for-move' && (
        <div className="w-full flex flex-col gap-2.5" role="group" aria-label="Available pawn moves">
          {/* Quick 1-Click Entry Button for Thayam */}
          {gameState.currentRoll?.value === 1 &&
            currentLegalMoves.some(
              (m) => activePlayer.pawns.find((p) => p.id === m.pawnId)?.position === OFF_BOARD
            ) && (
              <button
                onClick={() => {
                  const entryMove = currentLegalMoves.find(
                    (m) => activePlayer.pawns.find((p) => p.id === m.pawnId)?.position === OFF_BOARD
                  );
                  if (entryMove) makeMove(entryMove);
                }}
                aria-label="Enter reserve pawn onto board with Thayam roll of 1"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-ink font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 border-2 border-brass-bright animate-pawn-hop"
              >
                <span>✨</span>
                <span>Enter Pawn onto Board (தாயம்)</span>
                <span>➔</span>
              </button>
            )}

          {/* Legal move options list */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-kolam-chalk/60 uppercase tracking-widest block">
              Available Moves ({currentLegalMoves.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {currentLegalMoves.map((m, idx) => {
                const p = activePlayer.pawns.find((p) => p.id === m.pawnId);
                const isEntry = p?.position === OFF_BOARD;
                const isCut = m.cutsPawnIds.length > 0;
                const isCenterDest = isAtCenter(m.toPosition, path);
                const isSelected = selectedPawnId === m.pawnId;

                return (
                  <button
                    key={idx}
                    onClick={() => makeMove(m)}
                    onMouseEnter={() => selectPawn(m.pawnId)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-brass-bright bg-brass/25 text-white ring-1 ring-brass-bright shadow'
                        : 'border-kolam-chalk/15 bg-stone-ink/60 text-kolam-chalk/80 hover:border-brass/50 hover:bg-stone-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow"
                        style={{ backgroundColor: COLOR_MAP[activeColor] }}
                      >
                        {m.pawnId + 1}
                      </span>
                      <span>
                        {isEntry
                          ? `Enter #${m.pawnId + 1} (தாயம்)`
                          : isCenterDest
                          ? `Sanctuary 🏆`
                          : `Move #${m.pawnId + 1} (+${m.rollValue})`}
                      </span>
                    </div>
                    {isCut && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/40">
                        ⚡ CUT
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pawn Tray */}
      <div className="w-full flex flex-col gap-1.5 pt-2 border-t border-kolam-chalk/10">
        <span className="text-[11px] text-kolam-chalk/60 uppercase tracking-wider">
          Pawn Roster ({activeColor})
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
                    const moves = currentLegalMoves.filter((m) => m.pawnId === pawn.id);
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
                    ? 'border-brass-bright bg-brass/30 ring-2 ring-brass-bright scale-105 shadow'
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
                <span className="text-[10px] text-kolam-chalk/70 font-medium">
                  {atCenter
                    ? 'Center 🏆'
                    : isOffBoard
                    ? canMove
                      ? '✨ Enter!'
                      : 'Reserve'
                    : `Pos ${pawn.position}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
