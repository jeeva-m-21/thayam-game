import { create } from 'zustand';
import {
  createGame,
  applyRoll,
  applyMove,
  legalMoves,
  rollDice,
  DEFAULT_BOARD,
  pickAiMove,
  getCellIdAtPosition,
  isBonusRoll,
  isAtCenter,
} from '@thayam/rules-engine';
import type { GameState, Move, PlayerColor } from '@thayam/rules-engine';
import { soundManager } from '../utils/audio';
import { useStatsStore } from './statsStore';
import { socketClient } from '../net/socketClient';

export type GameMode = 'local' | 'vs-ai' | 'online';

interface GameStore {
  mode: GameMode;
  gameState: GameState;
  selectedPawnId: number | null;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  isAiThinking: boolean;
  history: string[];
  isMuted: boolean;
  lastCutCellId: string | null;
  onlineRoomId: string | null;
  onlineColor: PlayerColor | null;
  isOnlineConnected: boolean;

  // Actions
  setMode: (mode: GameMode) => void;
  setAiDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  toggleMute: () => void;
  joinOnlineRoom: (roomId: string, color: PlayerColor) => void;
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
  isMuted: soundManager.isMuted(),
  lastCutCellId: null,
  onlineRoomId: null,
  onlineColor: null,
  isOnlineConnected: false,

  setMode: (mode: GameMode) => {
    set({ mode });
    get().resetGame();
  },

  joinOnlineRoom: (roomId: string, color: PlayerColor) => {
    socketClient.connect();
    socketClient.joinRoom(roomId, color);
    set({
      mode: 'online',
      onlineRoomId: roomId,
      onlineColor: color,
      isOnlineConnected: true,
      history: [`Joined online room ${roomId} as ${color}.`, ...get().history],
    });

    socketClient.onRoomState((payload) => {
      set({ gameState: payload.gameState });
    });

    socketClient.onMoveRejected((err) => {
      set({ history: [`Server rejected move: ${err.error}`, ...get().history] });
    });
  },

  toggleMute: () => {
    const next = !get().isMuted;
    soundManager.setMuted(next);
    set({ isMuted: next });
  },

  setAiDifficulty: (aiDifficulty: 'easy' | 'medium' | 'hard') => {
    set({ aiDifficulty });
  },


  resetGame: (players: PlayerColor[] = ['red', 'green']) => {
    const gameState = createGame(DEFAULT_BOARD, players);
    useStatsStore.getState().resetStats();
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

    if (mode === 'online') {
      soundManager.playDiceRoll();
      socketClient.rollDice();
      return;
    }

    soundManager.playDiceRoll();
    const roll = rollDice();
    const nextState = applyRoll(gameState, roll);
    const currColor = gameState.turnOrder[gameState.currentPlayerIndex];
    const isBonus = isBonusRoll(roll.value);
    useStatsStore.getState().recordRoll(currColor, isBonus);
    if (isBonus) {
      setTimeout(() => soundManager.playBonusRoll(roll.value), 220);
    }
    const log = `${currColor} rolled ${roll.value} (${roll.dieA} + ${roll.dieB})${isBonus ? ' 🌟 BONUS ROLL!' : ''}`;

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

    if (mode === 'online') {
      soundManager.playPawnMove();
      socketClient.makeMove(move);
      set({ selectedPawnId: null });
      return;
    }

    const movingPawn = gameState.players[move.playerColor].pawns.find((p) => p.id === move.pawnId);
    const fromPos = movingPawn ? movingPawn.position : -1;
    const distance = move.toPosition - (fromPos === -1 ? -1 : fromPos);
    const reachedCenter = isAtCenter(move.toPosition, gameState.board.players[move.playerColor]);
    useStatsStore.getState().recordMove(move.playerColor, Math.max(0, distance), move.cutsPawnIds.length, reachedCenter);
    for (const cut of move.cutsPawnIds) {
      useStatsStore.getState().recordPawnCut(cut.owner);
    }

    const nextState = applyMove(gameState, move);
    let cutCell: string | null = null;
    if (move.cutsPawnIds.length > 0) {
      soundManager.playCut();
      const path = gameState.board.players[move.playerColor];
      cutCell = getCellIdAtPosition(path, move.toPosition);
    } else {
      soundManager.playPawnMove();
    }

    if (nextState.winner) {
      soundManager.playVictory();
    }

    let log = `${move.playerColor} moved pawn ${move.pawnId + 1}`;
    if (move.cutsPawnIds.length > 0) {
      log += ` & cut ${move.cutsPawnIds.length} opponent pawn(s)! ⚡`;
    }
    if (nextState.winner) {
      log += ` 🏆 ${nextState.winner} WINS THE GAME!`;
    }

    set((s) => ({
      gameState: nextState,
      selectedPawnId: null,
      history: [log, ...s.history].slice(0, 30),
      lastCutCellId: cutCell,
    }));

    if (cutCell) {
      setTimeout(() => {
        if (get().lastCutCellId === cutCell) {
          set({ lastCutCellId: null });
        }
      }, 1000);
    }

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
