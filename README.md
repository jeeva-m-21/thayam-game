# Thayam (Dayakattai) Digital Game

Classic digital implementation of **Thayam (Dayakattai)**, the traditional Tamil board game played on a 7×7 grid with cuboid brass dice.

Built according to strict rules specifications in [`Thayam_PRD.md`](./Thayam_PRD.md) and design systems in [`design.md`](./design.md).

---

## 🎯 Features

- **Provably Correct Rules Engine**: Zero-dependency TypeScript engine tested with 1000-game fuzz harness and 100% rule-table branch coverage.
- **Classic 7×7 Board Layout**: 4 colored home edge-midpoint squares, 8 safe spots (✕), center shared sanctuary, and private inner paths.
- **Daayam Dice Simulation**: Two cuboid dice with 0, 1, 2, 3 faces; sum evaluation with special $0+0 \to 12$ rule.
- **Turn Mechanics & Rules**:
  - Entry on exact roll of 1 at home square.
  - Bonus rolls on 1, 5, 6, and 12 with chaining.
  - Safe-square immunity & multi-occupancy.
  - Opponent pawn cutting and inner-path unlock requirement ($\ge 1$ cut).
  - Outer ring loop-around until cut is made.
  - Exact center landing requirement (no overshoot).
- **Game Modes**:
  - **vs AI**: Heuristic bot with 3 difficulty tiers (Easy, Medium, Hard with 1-ply lookahead).
  - **Pass & Play**: Local turn-based play.
  - **Online Multiplayer**: Real-time room server with authoritative server validation.
- **Bilingual Interface**: Seamless real-time toggle between English and Tamil (தமிழ்).

---

## 🚀 Quickstart

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x

### Install Dependencies
```bash
pnpm install
```

### Run Tests
```bash
# Run all unit and invariant tests across workspace
pnpm test

# Run tests in rules-engine (including 1,000-game fuzz harness)
pnpm --filter @thayam/rules-engine test
```

### Start Web Client (Development)
```bash
pnpm --filter @thayam/web run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Start Multiplayer Server
```bash
pnpm --filter @thayam/server run dev
```
Server listens on port 4000.

---

## 🏗️ Repository Architecture

- [`packages/rules-engine`](./packages/rules-engine): Shared pure TypeScript rules engine, path abstraction, and AI logic.
- [`packages/shared`](./packages/shared): Design tokens (colors, fonts), i18n dictionaries (EN/TA), analytics interface.
- [`packages/web`](./packages/web): React 18, Vite, Tailwind CSS, Zustand client.
- [`packages/server`](./packages/server): Fastify, Socket.io authoritative multiplayer server.
