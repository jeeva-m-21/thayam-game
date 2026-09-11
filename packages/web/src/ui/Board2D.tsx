import React from 'react';
import { useGameStore } from '../state/gameStore';
import { legalMoves, getCellIdAtPosition, OFF_BOARD, isAtCenter } from '@thayam/rules-engine';
import type { PlayerColor } from '@thayam/rules-engine';

// Coordinates for 7x7 grid cells:
// Outer ring: perimeter
// Home-stretch and center: cross inside
interface CellLayout {
  r: number;
  c: number;
}

const CELL_COORDS: Record<string, CellLayout> = {
  // Outer ring
  o00: { r: 0, c: 0 }, o01: { r: 0, c: 1 }, o02: { r: 0, c: 2 }, o03: { r: 0, c: 3 }, o04: { r: 0, c: 4 }, o05: { r: 0, c: 5 }, o06: { r: 0, c: 6 },
  o16: { r: 1, c: 6 }, o26: { r: 2, c: 6 }, o36: { r: 3, c: 6 }, o46: { r: 4, c: 6 }, o56: { r: 5, c: 6 }, o66: { r: 6, c: 6 },
  o65: { r: 6, c: 5 }, o64: { r: 6, c: 4 }, o63: { r: 6, c: 3 }, o62: { r: 6, c: 2 }, o61: { r: 6, c: 1 }, o60: { r: 6, c: 0 },
  o50: { r: 5, c: 0 }, o40: { r: 4, c: 0 }, o30: { r: 3, c: 0 }, o20: { r: 2, c: 0 }, o10: { r: 1, c: 0 },
  // Home stretch
  hr1: { r: 3, c: 1 }, hr2: { r: 3, c: 2 },
  hg1: { r: 1, c: 3 }, hg2: { r: 2, c: 3 },
  hy1: { r: 5, c: 3 }, hy2: { r: 4, c: 3 },
  hb1: { r: 3, c: 5 }, hb2: { r: 3, c: 4 },
  // Center
  center: { r: 3, c: 3 },
};

const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#B2312F',
  green: '#4B7A46',
  yellow: '#D9A22A',
  blue: '#2E4C74',
};

export const Board2D: React.FC = () => {
  const { gameState, selectedPawnId, selectPawn, makeMove } = useGameStore();
  const activeColor = gameState.turnOrder[gameState.currentPlayerIndex];
  const activePlayer = gameState.players[activeColor];
  const activePath = gameState.board.players[activeColor];

  const currentLegalMoves = gameState.currentRoll && gameState.phase === 'waiting-for-move'
    ? legalMoves(gameState, gameState.currentRoll.value)
    : [];

  const availablePawns = new Set(currentLegalMoves.map(m => m.pawnId));

  // Determine destination cells if a pawn is selected
  const movesForSelected = selectedPawnId !== null
    ? currentLegalMoves.filter(m => m.pawnId === selectedPawnId)
    : [];

  const targetCellIds = new Set(
    movesForSelected.map(m => getCellIdAtPosition(activePath, m.toPosition))
  );

  return (
    <div className="relative w-full max-w-[480px] aspect-square p-2 bg-floor-oxide rounded-2xl shadow-2xl border-4 border-brass">
      {/* 7x7 Grid */}
      <div className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full bg-stone-ink/40 p-2 rounded-xl">
        {Array.from({ length: 49 }).map((_, idx) => {
          const r = Math.floor(idx / 7);
          const c = idx % 7;

          // Find cell id at this coordinate
          const entry = Object.entries(CELL_COORDS).find(([, coord]) => coord.r === r && coord.c === c);
          const cellId = entry ? entry[0] : null;
          const cell = cellId ? gameState.board.cells[cellId] : null;

          if (!cell || !cellId) {
            return (
              <div
                key={`empty-${r}-${c}`}
                className="w-full h-full bg-stone-ink/20 rounded-md border border-stone-ink/30 opacity-20"
              />
            );
          }

          const isTarget = targetCellIds.has(cellId);
          const isHome = Object.values(gameState.board.players).some(p => p.homeCellId === cellId);
          const isCenter = cell.type === 'center';

          // Pawns located here
          const pawnsHere: Array<{ color: PlayerColor; id: number }> = [];
          for (const color of gameState.turnOrder) {
            const pState = gameState.players[color];
            const path = gameState.board.players[color];
            for (const p of pState.pawns) {
              if (p.position !== OFF_BOARD) {
                const pawnCellId = getCellIdAtPosition(path, p.position);
                if (pawnCellId === cellId) {
                  pawnsHere.push({ color, id: p.id });
                }
              }
            }
          }

          return (
            <div
              key={cellId}
              onClick={() => {
                if (isTarget && selectedPawnId !== null) {
                  const chosenMove = movesForSelected.find(
                    m => getCellIdAtPosition(activePath, m.toPosition) === cellId
                  );
                  if (chosenMove) makeMove(chosenMove);
                }
              }}
              className={`relative flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                isTarget
                  ? 'bg-brass-bright ring-4 ring-kolam-chalk shadow-lg scale-105 z-20'
                  : isCenter
                  ? 'bg-brass/60 border-2 border-brass-bright'
                  : cell.isSafe
                  ? 'bg-brass/25 border border-brass'
                  : 'bg-stone-ink/60 border border-kolam-chalk/10 hover:border-kolam-chalk/30'
              }`}
            >
              {/* Safe cross emblem */}
              {cell.isSafe && (
                <span className="absolute text-brass/40 text-lg select-none pointer-events-none">
                  ✕
                </span>
              )}

              {/* Home indicator */}
              {isHome && cell.ownerColor && (
                <div
                  className="absolute inset-1 rounded opacity-25"
                  style={{ backgroundColor: COLOR_MAP[cell.ownerColor] }}
                />
              )}

              {/* Center emblem */}
              {isCenter && (
                <span className="text-[10px] text-brass-bright tracking-wider z-10">தாயம்</span>
              )}

              {/* Target indicator ring */}
              {isTarget && (
                <div className="absolute inset-0.5 rounded-lg border-2 border-dashed border-kolam-chalk animate-pulse" />
              )}

              {/* Pawns on cell */}
              <div className="flex flex-wrap items-center justify-center gap-0.5 z-10">
                {pawnsHere.map((p) => {
                  const isCurrentActive = p.color === activeColor;
                  const canPick = isCurrentActive && availablePawns.has(p.id);
                  const isSelected = isCurrentActive && selectedPawnId === p.id;

                  return (
                    <button
                      key={`${p.color}-${p.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canPick) {
                          selectPawn(selectedPawnId === p.id ? null : p.id);
                        } else if (isTarget && selectedPawnId !== null) {
                          const chosenMove = movesForSelected.find(
                            m => getCellIdAtPosition(activePath, m.toPosition) === cellId
                          );
                          if (chosenMove) makeMove(chosenMove);
                        }
                      }}
                      className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border-2 transition-transform ${
                        isSelected
                          ? 'ring-2 ring-white scale-125 z-30'
                          : canPick
                          ? 'animate-bounce border-white'
                          : 'border-black/40'
                      }`}
                      style={{ backgroundColor: COLOR_MAP[p.color] }}
                    >
                      {p.id + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
