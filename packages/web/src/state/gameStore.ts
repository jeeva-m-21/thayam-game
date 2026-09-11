import { create } from 'zustand';
import {
  createGame,
  applyRoll,
  applyMove,
  legalMoves,
  rollDice,
  DEFAULT_BOARD,
  pickAiMove,
} from '@thayam/rules-engine';
import type { GameState, Move, PlayerColor } from '@thayam/rules-engine';
import { soundManager } from '../utils/audio';

export type GameMode = 'local' | 'vs-ai';

interface GameStore {
  mode: GameMode;
  gameState: GameState;
  selectedPawnId: number | null;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  isAiThinking: boolean;
  history: string[];

  // Actions
  setMode: (mode: GameMode) => void;
  resetGame: (players?: PlayerColor[]) => void;
  rollCurrentPlayer: () => void;
  selectPawn: (pawnId: number | null) => void;
  makeMove: (move: Move) => void;
  triggerAiTurnIfNeeded: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'vs-ai',
  gameState: createGame(DEFAULT_BOARD, ['red', 'green']),
  selectedPawnId: null,
  aiDifficulty: 'medium',
  isAiThinking: false,
  history: ['Game initialized.'],

  setMode: (mode: GameMode) => {
    set({ mode });
    get().resetGame();
  },

  resetGame: (players: PlayerColor[] = ['red', 'green']) => {
    const gameState = createGame(DEFAULT_BOARD, players);
    set({
      gameState,
      selectedPawnId: null,
      isAiThinking: false,
      history: ['New game started.'],
    });
  },

  rollCurrentPlayer: () => {
    const { gameState, mode, triggerAiTurnIfNeeded } = get();
    if (gameState.phase !== 'waiting-for-roll') return;

    soundManager.playDiceRoll();
    const roll = rollDice();
    const nextState = applyRoll(gameState, roll);
    const currColor = gameState.turnOrder[gameState.currentPlayerIndex];
    const log = `${currColor} rolled ${roll.value} (${roll.dieA} + ${roll.dieB})`;

    set((s) => ({
      gameState: nextState,
      selectedPawnId: null,
      history: [log, ...s.history].slice(0, 30),
    }));

    // If no moves and turn ended, check AI
    if (mode === 'vs-ai') {
      setTimeout(() => get().triggerAiTurnIfNeeded(), 600);
    }
  },

  selectPawn: (pawnId: number | null) => {
    set({ selectedPawnId: pawnId });
  },

  makeMove: (move: Move) => {
    const { gameState, mode } = get();
    if (gameState.phase !== 'waiting-for-move') return;

    const nextState = applyMove(gameState, move);
    if (move.cutsPawnIds.length > 0) {
      soundManager.playCut();
    } else {
      soundManager.playPawnMove();
    }

    if (nextState.winner) {
      soundManager.playVictory();
    }

    let log = `${move.playerColor} moved pawn ${move.pawnId + 1}`;
    if (move.cutsPawnIds.length > 0) {
      log += ` & cut ${move.cutsPawnIds.length} opponent pawn(s)!`;
    }
    if (nextState.winner) {
      log += ` 🏆 ${nextState.winner} WINS THE GAME!`;
    }

    set((s) => ({
      gameState: nextState,
      selectedPawnId: null,
      history: [log, ...s.history].slice(0, 30),
    }));

    if (mode === 'vs-ai') {
      setTimeout(() => get().triggerAiTurnIfNeeded(), 600);
    }
  },


  triggerAiTurnIfNeeded: () => {
    const { gameState, mode, aiDifficulty, rollCurrentPlayer, makeMove } = get();
    if (mode !== 'vs-ai' || gameState.phase === 'game-over') return;

    const activeColor = gameState.turnOrder[gameState.currentPlayerIndex];
    if (activeColor !== 'green') return; // Green is AI

    set({ isAiThinking: true });

    if (gameState.phase === 'waiting-for-roll') {
      setTimeout(() => {
        rollCurrentPlayer();
        set({ isAiThinking: false });
      }, 500);
    } else if (gameState.phase === 'waiting-for-move' && gameState.currentRoll) {
      setTimeout(() => {
        const aiMove = pickAiMove(gameState, gameState.currentRoll!.value, aiDifficulty);
        if (aiMove) {
          makeMove(aiMove);
        }
        set({ isAiThinking: false });
      }, 700);
    }
  },
}));
