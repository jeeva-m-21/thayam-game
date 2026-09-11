import { create } from 'zustand';
import type { PlayerColor } from '@thayam/rules-engine';

export interface PlayerStats {
  color: PlayerColor;
  cutsMade: number;
  pawnsCut: number;
  bonusRollsCount: number;
  totalRollsCount: number;
  totalDistanceMoved: number;
  pawnsInSanctuary: number;
}

const initialStats = (): Record<PlayerColor, PlayerStats> => ({
  red: {
    color: 'red',
    cutsMade: 0,
    pawnsCut: 0,
    bonusRollsCount: 0,
    totalRollsCount: 0,
    totalDistanceMoved: 0,
    pawnsInSanctuary: 0,
  },
  green: {
    color: 'green',
    cutsMade: 0,
    pawnsCut: 0,
    bonusRollsCount: 0,
    totalRollsCount: 0,
    totalDistanceMoved: 0,
    pawnsInSanctuary: 0,
  },
  yellow: {
    color: 'yellow',
    cutsMade: 0,
    pawnsCut: 0,
    bonusRollsCount: 0,
    totalRollsCount: 0,
    totalDistanceMoved: 0,
    pawnsInSanctuary: 0,
  },
  blue: {
    color: 'blue',
    cutsMade: 0,
    pawnsCut: 0,
    bonusRollsCount: 0,
    totalRollsCount: 0,
    totalDistanceMoved: 0,
    pawnsInSanctuary: 0,
  },
});

interface StatsStore {
  stats: Record<PlayerColor, PlayerStats>;
  recordRoll: (player: PlayerColor, isBonus: boolean) => void;
  recordMove: (player: PlayerColor, distance: number, cutsCount: number, reachedCenter: boolean) => void;
  recordPawnCut: (victim: PlayerColor) => void;
  resetStats: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  stats: initialStats(),

  recordRoll: (player: PlayerColor, isBonus: boolean) => {
    set((state) => ({
      stats: {
        ...state.stats,
        [player]: {
          ...state.stats[player],
          totalRollsCount: state.stats[player].totalRollsCount + 1,
          bonusRollsCount: state.stats[player].bonusRollsCount + (isBonus ? 1 : 0),
        },
      },
    }));
  },

  recordMove: (player: PlayerColor, distance: number, cutsCount: number, reachedCenter: boolean) => {
    set((state) => ({
      stats: {
        ...state.stats,
        [player]: {
          ...state.stats[player],
          totalDistanceMoved: state.stats[player].totalDistanceMoved + distance,
          cutsMade: state.stats[player].cutsMade + (cutsCount > 0 ? 1 : 0),
          pawnsInSanctuary: state.stats[player].pawnsInSanctuary + (reachedCenter ? 1 : 0),
        },
      },
    }));
  },

  recordPawnCut: (victim: PlayerColor) => {
    set((state) => ({
      stats: {
        ...state.stats,
        [victim]: {
          ...state.stats[victim],
          pawnsCut: state.stats[victim].pawnsCut + 1,
        },
      },
    }));
  },

  resetStats: () => {
    set({ stats: initialStats() });
  },
}));
