/**
 * types.ts — Thayam Rules Engine Core Types
 *
 * All types used throughout the engine. Zero imports from external packages.
 * Design refs: AGENTS.md §5 (BoardData schema), PRD §8 (rules).
 */

// ─── Player ────────────────────────────────────────────────────────────────

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export const ALL_PLAYER_COLORS: readonly PlayerColor[] = [
  'red',
  'green',
  'yellow',
  'blue',
] as const;

// ─── Board ─────────────────────────────────────────────────────────────────

export type CellType = 'outer' | 'inner' | 'home-stretch' | 'center' | 'off-board';

export interface Cell {
  /** Stable identifier, e.g. "outer-17" */
  id: string;
  type: CellType;
  /** True for the 8 safe squares (PRD §8.2) — no cutting, multi-occupancy allowed */
  isSafe: boolean;
  /** Set for home-stretch cells and the owning player's home cell */
  ownerColor?: PlayerColor;
}

export interface PlayerPath {
  color: PlayerColor;
  /** The player's home/starting cell — also the entry cell (roll of 1 lands here) */
  homeCellId: string;
  /**
   * Ordered list of cell ids this color's pawns traverse on the outer ring.
   * Starts at the entry cell and proceeds anti-clockwise until just before home.
   */
  outerSequence: string[];
  /**
   * Private inner home-stretch cells, from entry to center (inclusive).
   * The last element MUST be the centerCellId.
   */
  homeStretchSequence: string[];
}

export interface BoardData {
  cells: Record<string, Cell>;
  players: Record<PlayerColor, PlayerPath>;
  centerCellId: string;
}

// ─── Pawn ──────────────────────────────────────────────────────────────────

/**
 * Position of a pawn in its owner's path index space.
 * -1 = off-board (not yet entered / was cut)
 * 0..outerSequence.length-1 = on the outer ring
 * outerSequence.length..outerSequence.length+homeStretchSequence.length-1 = on home-stretch
 */
export type PawnPosition = number; // -1 = off-board, ≥0 = path index

export const OFF_BOARD: PawnPosition = -1;

export interface PawnState {
  /** Index 0–3 within a player's 4 pawns */
  id: number;
  owner: PlayerColor;
  /** Path index into [...outerSequence, ...homeStretchSequence], or OFF_BOARD */
  position: PawnPosition;
}

// ─── Dice ──────────────────────────────────────────────────────────────────

/** Raw face values of one cuboid die: blank=0, 1, 2, 3 */
export type DieFace = 0 | 1 | 2 | 3;

export interface DiceRoll {
  dieA: DieFace;
  dieB: DieFace;
  /** Resolved value per PRD §8.3 table — 0+0 → 12, otherwise dieA+dieB */
  value: number;
}

/** Roll values that grant a bonus roll (PRD §8.4.3) */
export const BONUS_ROLL_VALUES: readonly number[] = [1, 5, 6, 12] as const;

/** Whether a roll value grants a bonus re-roll */
export function isBonusRoll(value: number): boolean {
  return BONUS_ROLL_VALUES.includes(value);
}

// ─── Move ──────────────────────────────────────────────────────────────────

export interface Move {
  /** Which player is moving */
  playerColor: PlayerColor;
  /** Which pawn (0–3) is being moved */
  pawnId: number;
  /** Roll value that generated this move */
  rollValue: number;
  /** Resulting path index after move (OFF_BOARD is not a valid destination) */
  toPosition: PawnPosition;
  /** Whether this move transitions from outer ring to home stretch */
  entersHomeStretch: boolean;
  /** Cell ids of any opponent pawns that will be cut by this move */
  cutsPawnIds: Array<{ owner: PlayerColor; pawnId: number }>;
}

// ─── Game State ────────────────────────────────────────────────────────────

export type TurnPhase =
  | 'waiting-for-roll'   // Player must roll the dice
  | 'waiting-for-move'   // Dice rolled, player must pick a pawn to move
  | 'game-over';         // A player has won

export interface PlayerState {
  color: PlayerColor;
  pawns: [PawnState, PawnState, PawnState, PawnState];
  /** True if this player has successfully cut ≥1 opponent pawn (unlocks inner path) */
  hasCutOpponent: boolean;
}

export interface GameState {
  board: BoardData;
  players: Record<PlayerColor, PlayerState>;
  /** Ordered list of players in turn order */
  turnOrder: PlayerColor[];
  /** Index into turnOrder for the current player */
  currentPlayerIndex: number;
  phase: TurnPhase;
  /** Most recent dice roll — null if phase is 'waiting-for-roll' */
  currentRoll: DiceRoll | null;
  /** Number of bonus rolls remaining for the current turn (1 per bonus trigger) */
  bonusRollsRemaining: number;
  /** Winner, if phase === 'game-over' */
  winner: PlayerColor | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function currentPlayer(state: GameState): PlayerState {
  const color = state.turnOrder[state.currentPlayerIndex];
  return state.players[color];
}

export function pathLength(path: PlayerPath): number {
  return path.outerSequence.length + path.homeStretchSequence.length;
}

export function isAtCenter(position: PawnPosition, path: PlayerPath): boolean {
  // Center is the last cell in homeStretchSequence
  const centerIndex = path.outerSequence.length + path.homeStretchSequence.length - 1;
  return position === centerIndex;
}

export function isOnHomeStretch(position: PawnPosition, path: PlayerPath): boolean {
  return position >= path.outerSequence.length && position < pathLength(path);
}
