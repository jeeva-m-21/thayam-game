# Product Requirements Document (PRD)
## Thayam (Dayakattai) — Digital Board Game

| | |
|---|---|
| **Document Type** | Product Requirements Document |
| **Product Name** | Thayam (Dayakattai) Digital Game |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Date** | September 11, 2026 |
| **Prepared For** | Product & Engineering Stakeholders |

---

## 1. Executive Summary

Thayam (also known as Dayakattai, Dayam, or Dayaboss) is an ancient Tamil race-and-capture board game played across South India, dating back to the Sangam period and referenced in the Mahabharata (the dice game between the Pandavas and Kauravas). It shares lineage with Pachisi and Ludo but has distinct mechanics: a two-piece cuboid dice system, anti-clockwise-then-clockwise pawn movement, mandatory cutting to unlock inner paths, and designated safe zones.

This PRD defines the requirements to build a **digital, cross-platform version of Thayam** that faithfully reproduces traditional rules while offering modern conveniences: online multiplayer, AI opponents, and a responsive UI. This document consolidates rule research from multiple sources (PlayOnlineDiceGames.com, Wikipedia, Centre for Contemporary Folklore, Historified, and existing Thayam mobile apps) and translates it into structured product requirements.

---

## 2. Background & Research

### 2.1 Cultural & Historical Context
- Thayam originated in Tamil Nadu, South India, and is believed to date back to the **Sangam period**.
- The word "Thayam" (தாயம்) means **"first stone"**; "Dayakattai" refers to the dice itself.
- The game is referenced in the **Mahabharata**, where Shakuni's manipulation of a dice game caused the Pandavas to lose their kingdom, wealth, and dignity — cementing the game's association with fate and chance in Indian cultural memory.
- Traditionally played by women as an indoor pastime; a related but distinct male-oriented variant also exists.
- The board can be drawn on the floor with chalk, etched into soil, or carved into stone (some historic monuments feature Thayam boards etched by craftsmen during downtime).
- Regional cousins of the same core game exist across India: **Pachisi**, **Chowka Bara / Chakka** (Karnataka), and **Ludo** — all race-type cross-and-circle games.

### 2.2 Existing Digital Implementations (Competitive Landscape)
| Product | Notes |
|---|---|
| PlayOnlineDiceGames.com — Thayam | Browser-based (jQuery/HTML5/CSS3), responsive, PvP and PvC modes |
| Thayam – Dayakattai (Google Play) | Native Android app; offline AI play; spiral board; token capture ("cutting") mechanics |
| Thaayam Guide (amal-david.github.io) | Bilingual (English/Tamil) reference guide with a dice-roll simulator |

### 2.3 Key Research Sources
1. PlayOnlineDiceGames.com — primary rules reference (as provided by stakeholder)
2. Wikipedia — "Dayakattai" article (extended rules, 8-coin and 12-coin variants, "Marudees/Majith" variant)
3. Centre for Contemporary Folklore — cultural/historical framing
4. Historified.in — historical article on Dayakattai
5. Google Play Store listing for an existing Thayam app — competitive feature reference

---

## 3. Problem Statement & Opportunity

Traditional Tamil games like Thayam are at risk of fading from everyday practice as physical board games and shell-based play give way to digital entertainment. At the same time, there is no single **authoritative, polished, mobile-first** digital version that:
- Faithfully implements the full traditional ruleset (including cutting, safe zones, and inner-path unlocking)
- Supports both solo (vs. AI) and social (multiplayer) play
- Bridges language/cultural gaps for the diaspora and non-Tamil players via bilingual UI and onboarding

**Opportunity:** Build a definitive digital Thayam product that preserves cultural heritage, is rules-accurate, and is enjoyable for both nostalgic traditional players and new audiences.

---

## 4. Goals & Objectives

### 4.1 Business Goals
- Launch a polished, free-to-play digital Thayam game within one product cycle.
- Establish this as the reference implementation for Thayam rules online.
- Build a foundation for future traditional-game titles (Pallankuzhi, Paramapadham/Pampu Thayam, etc.) under the same platform.

### 4.2 User Goals
- Play authentic Thayam anywhere, anytime, without needing physical dice/board or four in-person players.
- Learn/relearn the rules through guided onboarding.
- Compete against friends or an AI at varying difficulty.

### 4.3 Success Metrics (KPIs)
| Metric | Target |
|---|---|
| D1 retention | ≥ 35% |
| Average session length | ≥ 8 minutes |
| Rule-accuracy support tickets/bug reports | < 2% of sessions |
| Multiplayer match completion rate | ≥ 80% |
| App store / product rating | ≥ 4.3 / 5 |

---

## 5. Target Users & Personas

| Persona | Description | Needs |
|---|---|---|
| **Nostalgic Traditionalist** | Tamil-speaking adult, 35–65, grew up playing Thayam with family | Rule accuracy, minimal clutter, easy pass-and-play with family |
| **Diaspora Reconnector** | Tamil diaspora, 20–40, limited fluency in rules | Bilingual instructions, tutorial mode, AI opponent |
| **Casual Puzzle/Board Gamer** | General mobile gamer, any ethnicity, 18–45 | Fast onboarding, matchmaking, clear visuals, no prior knowledge needed |
| **Family/Kids Player** | Parents introducing children to cultural games | Simple explanations, safe online multiplayer with friends/family only |

---

## 6. Scope

### 6.1 In Scope (v1.0)
- Single game mode: **Classic Thayam** (4 pawns per player, 2–4 players, 7×7 board) as detailed in Section 8.
- Game modes: Player vs. AI (3 difficulty levels), Local Pass-and-Play, Online Multiplayer (2–4 players).
- Full rules engine: dice mechanics, cutting, safe zones, inner-path unlock condition, win condition.
- Onboarding tutorial and rules reference screen (bilingual: English + Tamil).
- Responsive UI for mobile (iOS/Android) and web/desktop browser.

### 6.2 Out of Scope (v1.0 — candidates for v2+)
- The extended 8-coin "paired pieces" variant.
- The 12-coin "Marudees/Majith" variant.
- Seashell-based dice skin/mode.
- Real-money wagering or in-app purchases.
- Spectator mode, tournaments, leaderboards (deferred to v2).
- Voice/video chat during multiplayer.

---

## 7. Assumptions & Constraints
- The primary reference ruleset is the one published at playonlinedicegames.com/thayam, cross-validated against Wikipedia and traditional sources.
- Where sources conflict (see Section 9.5), the product will default to the most commonly cited convention and flag it as a **configurable rule variant** rather than hard-coding a single interpretation.
- Game must function fully offline for AI and local pass-and-play modes.
- Target platforms: iOS, Android, responsive web (desktop + mobile browser).

---

## 8. Detailed Game Rules Specification

This section is the authoritative functional specification the engineering team must implement in the rules engine.

### 8.1 Players
- 2 to 4 players.
- Each player controls **4 pawns** of a single color: **Red, Green, Yellow, or Blue**.
- In a 2-player game, players occupy **opposite sides** of the board.
- Turn order proceeds **clockwise**.

### 8.2 Board Layout
- A **7×7 grid** of squares.
- The center square of each of the 4 board edges is a player's **home** square, color-coded (Red, Green, Yellow, Blue).
- The absolute **center square** of the grid is the shared **final destination** for all pawns, marked with a cross (safe/neutral).
- **8 safe spots** total are marked with a cross (✕), including each player's home square. Pawns on safe spots cannot be cut and multiple pawns (from any player) may co-occupy a safe spot.
- Movement path: pawns travel **anti-clockwise** through the **outer ring** of squares, then transition to **clockwise** movement through the **inner squares** toward the center.
- Each player enters their inner path from **one square behind their own home square**, marked with a directional arrow specific to their color.

### 8.3 Dice Mechanics
- The game uses **two 4-sided cuboid dice** ("Daayam"), digitally simulated.
- Each die face shows: **blank (0), 1, 2, or 3** pips.
- **Roll value = sum of both dice**, with one special-case override:
  - If **both dice show blank (0 + 0)**, the roll value is **12**, not 0.
- **Valid roll outcomes:** 1, 2, 3, 4, 5, 6, 12.

**Dice Combination Table**

| Die A \ Die B | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **0** | 12 | 1 | 2 | 3 |
| **1** | 1 | 2 | 3 | 4 |
| **2** | 2 | 3 | 4 | 5 |
| **3** | 3 | 4 | 5 | 6 |

### 8.4 Turn Structure & Movement Rules
1. **Entering the board:** A pawn starts off-board. It may only enter at the player's home square when a roll of **exactly 1** occurs.
2. **Moving a pawn already in play:** The pawn moves forward exactly the number of squares equal to the roll value.
3. **Bonus roll rule:** Rolling **1, 5, 6, or 12** grants the player another roll — regardless of whether a legal move was available or made.
4. **Mandatory move rule:** If a legal move exists, the player **must** make it (no voluntarily forfeiting a valid move).
5. **End of turn:** A turn ends when the player has exhausted all valid moves and has not rolled a bonus value (1, 5, 6, or 12).
6. **Occupancy rules:**
   - A regular (non-safe) square may hold **only one pawn** at a time.
   - A player **cannot** move a pawn onto a square already occupied by **their own** other pawn.
   - Safe spots (✕) may hold **multiple pawns from multiple players** simultaneously.
7. **Cutting (capturing):**
   - If a player's pawn lands on a square occupied by an **opponent's** pawn (on a non-safe square), the opponent's pawn is **cut** — removed from the board and sent back to off-board status.
   - A cut pawn re-enters play under the same rule as a new pawn: it requires a roll of exactly 1 at its owner's home square.
   - Cutting **cannot** occur on any of the 8 safe spots.
8. **Unlocking the inner path:**
   - A player must **cut at least one opponent pawn** before any of their pawns may transition from the outer ring to the inner squares.
   - Until this condition is met, that player's pawns must continue circling the outer ring.
9. **Winning condition:** The **first player to move all 4 of their pawns into the center destination square** wins the game. The center square is a shared, safe destination.

### 8.5 Rule Summary Table

| Rule Category | Rule |
|---|---|
| Players | 2–4, one color each, 4 pawns each |
| Entry condition | Roll of exactly 1 |
| Movement | Exact roll value, forward only |
| Bonus rolls | 1, 5, 6, 12 → roll again |
| Direction | Anti-clockwise (outer) → clockwise (inner) |
| Safe zones | 8 total, includes all homes + center; no cutting; multi-occupancy allowed |
| Cutting | Landing on opponent's pawn (non-safe square) sends it off-board |
| Inner-path unlock | Requires ≥1 successful cut |
| Win condition | All 4 pawns reach center square first |

### 8.6 Known Source Variations (for Product Decision)
Cross-referencing multiple sources revealed minor rule variants across regions/traditions. These should be implemented as **togglable rule presets** (default = Section 8.4 above, matching the primary reference site):

| Topic | Primary Reference (playonlinedicegames.com) | Alternate Source Variant |
|---|---|---|
| Piece count | 4 pawns/player | Traditional/Wikipedia describes 6 or 12-coin formats with paired-piece sub-variants |
| Distributing a multi-roll turn | Not explicitly specified — implied single active pawn per roll | Wikipedia: rolled values (e.g., 5, 12, 2 from a bonus-roll sequence) can be freely distributed across multiple different pawns in the same turn |
| Board shape | 7×7 grid | Some traditional descriptions use a drawn cross-shaped ("plus") board rather than a strict grid |

**Recommendation:** Ship v1.0 with the 4-pawn, 7×7 grid ruleset (Section 8.4) as the default and only supported mode. Flag the multi-pawn distribution rule and extended piece-count variants as v2+ backlog items pending further rule validation with subject-matter experts/native players.

---

## 9. Functional Requirements

### 9.1 Core Gameplay Engine
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | System shall simulate two 4-sided dice per the combination table in 8.3 | P0 |
| FR-2 | System shall enforce entry rule (roll of 1 required to enter board) | P0 |
| FR-3 | System shall grant bonus rolls on 1, 5, 6, 12 | P0 |
| FR-4 | System shall enforce anti-clockwise outer / clockwise inner movement path per player color | P0 |
| FR-5 | System shall enforce single-occupancy on non-safe squares | P0 |
| FR-6 | System shall execute cutting logic and return cut pawns to off-board state | P0 |
| FR-7 | System shall block inner-path entry until the player has cut ≥1 opponent pawn | P0 |
| FR-8 | System shall enforce mandatory-move rule when a legal move exists | P0 |
| FR-9 | System shall detect and declare a win when a player's 4th pawn reaches center | P0 |
| FR-10 | System shall correctly cycle turn order clockwise among 2–4 players | P0 |

### 9.2 Game Modes
| ID | Requirement | Priority |
|---|---|---|
| FR-11 | Support Player vs. AI with 3 difficulty tiers (Easy, Medium, Hard) | P0 |
| FR-12 | Support local pass-and-play for 2–4 players on one device | P0 |
| FR-13 | Support online real-time multiplayer for 2–4 players | P1 |
| FR-14 | Support reconnect-on-disconnect for online matches (grace period) | P1 |

### 9.3 UX / Onboarding
| ID | Requirement | Priority |
|---|---|---|
| FR-15 | Interactive first-time tutorial covering entry, movement, cutting, safe zones, and winning | P0 |
| FR-16 | In-game rules reference accessible at any time, bilingual (English/Tamil) | P0 |
| FR-17 | Visual highlighting of legal moves after each dice roll | P0 |
| FR-18 | Animated pawn movement and cut/capture feedback (visual + audio cue) | P1 |
| FR-19 | Turn indicator and bonus-roll indicator clearly surfaced in UI | P0 |

### 9.4 Platform & Accessibility
| ID | Requirement | Priority |
|---|---|---|
| FR-20 | Responsive layout for mobile (portrait/landscape) and desktop browser | P0 |
| FR-21 | Colorblind-safe palette option for the 4 player colors | P1 |
| FR-22 | Support English and Tamil UI localization | P1 |

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dice roll → UI response within 300ms; move animation ≤ 1s |
| Availability | Online multiplayer service uptime ≥ 99.5% |
| Scalability | Support concurrent multiplayer matches scaling to peak regional traffic (e.g., festival periods, Pongal) |
| Security | No PII beyond minimal account/profile data; secure matchmaking sessions |
| Compatibility | iOS 15+, Android 10+, evergreen desktop/mobile browsers |
| Offline support | AI and pass-and-play modes fully functional without network connectivity |

---

## 11. User Experience Flow (High-Level)

1. **Launch → Home Screen**: Play vs AI / Pass-and-Play / Online Multiplayer / Learn to Play / Settings.
2. **Learn to Play**: Bilingual interactive tutorial walking through Sections 8.2–8.4.
3. **Match Setup**: Choose player count (2–4), assign colors, select AI difficulty (if applicable).
4. **Gameplay Loop**: Roll dice → legal moves highlighted → player selects pawn/move → animation → cut/safe-zone resolution → bonus roll check → turn passes or continues.
5. **Win Screen**: Victory animation, match summary (cuts made, turns taken), rematch/share options.

---

## 12. Risks & Open Questions

| Risk / Question | Impact | Mitigation |
|---|---|---|
| Rule variations across regions (Section 8.6) may cause disputes among traditional players | Medium | Ship configurable rule presets; validate with native players/community before v1 launch |
| Ambiguity in "distributing" multiple dice values across pawns in one turn | Medium | Default to conservative single-pawn-per-roll interpretation for v1; gather user feedback |
| Cultural sensitivity in representing a heritage game | Medium | Engage Tamil cultural consultants/community reviewers pre-launch |
| AI difficulty balancing for a game with high dice variance | Low–Medium | Implement AI heuristics around cutting priority, safe-zone usage, and inner-path unlock priority; playtest extensively |

---

## 13. Milestones (Indicative)

| Phase | Deliverable | Target |
|---|---|---|
| M1 | Rules engine + local pass-and-play prototype | Sprint 1–3 |
| M2 | AI opponent (Easy/Medium) + tutorial | Sprint 4–6 |
| M3 | Full UI/UX polish + bilingual support | Sprint 7–8 |
| M4 | Online multiplayer + reconnect handling | Sprint 9–11 |
| M5 | Beta with community playtesters (native Thayam players) | Sprint 12 |
| M6 | GA Launch | Sprint 13 |

---

## 14. Appendix — Source Material

1. PlayOnlineDiceGames.com, *"Thayam (Dayakattai) Dice Game Rules,"* https://www.playonlinedicegames.com/thayam
2. Wikipedia, *"Dayakattai,"* https://en.wikipedia.org/wiki/Dayakattai
3. Centre for Contemporary Folklore, *"Traditional Games of Tamil Nadu,"* https://centreforcontemporaryfolklore.org/2025/05/02/traditional-games-of-tamil-nadu/
4. Historified, *"Discover the Ancient Strategy: Unveiling the Rich History and Rules of Dayakattai,"* https://historified.in/2024/06/04/discover-the-ancient-strategy-unveiling-the-rich-history-and-rules-of-dayakattai/
5. Google Play Store, *"Thayam – Dayakattai Dice Game,"* https://play.google.com/store/apps/details?id=com.chozhanaadu.thayam
6. Thaayam Guide (bilingual reference + simulator), https://amal-david.github.io/thaayam-guide/
7. Instructables, *"Dayakattai: 8 Steps,"* https://www.instructables.com/Dayakattai/

---

*End of Document*