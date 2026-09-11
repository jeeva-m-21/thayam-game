# Design.md
## Thayam (Dayakattai) — Product Design System & UX Specification

| | |
|---|---|
| **Companion to** | Thayam_PRD.md v1.0 |
| **Scope** | Visual identity, 3D system, UX flows, interaction design, deployment-grade engineering constraints |
| **Status** | Draft for Design Review |
| **Date** | September 11, 2026 |

---

## 1. Design Brief, Restated

Thayam is not a generic "board game app" — it's a **living room floor game**, drawn in chalk on a red-oxide-cement floor, played with brass dice passed hand to hand, watched over by grandparents who know every rule by muscle memory. The digital product's entire design mandate flows from one tension:

> **Make it feel like the object it's replacing — the chalk board, the brass dice, the tactile clack of a cut pawn being lifted off — while being legible and inviting to someone who has never seen it before.**

This is not a SaaS dashboard, not a casino app, and not a children's cartoon game. It is a **heritage object rendered in glass and light** — dignified, tactile, warm. Every 3D and UX decision below is filtered through that lens.

---

## 2. User Analysis

We design for four personas (carried from the PRD), but their needs pull in genuinely different directions. Naming the tension up front prevents us from designing a lowest-common-denominator product.

### 2.1 Persona-to-Design Matrix

| Persona | Core need | What breaks the experience for them | Design implication |
|---|---|---|---|
| **Nostalgic Traditionalist** (35–65, grew up playing) | Instant recognition — "this *is* the game I know" | Over-simplified board, Americanized pawn shapes, missing safe-zone crosses, wrong dice (6-sided instead of the cuboid Daayam) | Board geometry, dice shape, and safe-zone iconography must be archaeologically accurate. No creative liberties on the board itself. |
| **Diaspora Reconnector** (20–40, rusty on rules) | Confidence — never feel lost or embarrassed | Rules buried in a menu; no in-context help; assumes fluency | Persistent, non-intrusive legal-move highlighting; a "why can't I move this?" tap-to-explain affordance; bilingual by default, not as a settings toggle |
| **Casual Board Gamer** (18–45, no prior context) | Fast time-to-fun | Long unskippable lore/tutorial; unclear win condition; unclear what "cutting" means | A playable 90-second guided first turn instead of a slideshow tutorial; clear iconographic legend always one tap away |
| **Family/Kids Player** (parent + child) | Warmth, safety, low reading burden | Aggressive "capture" language/violence framing; tiny tap targets; chat with strangers | Soft, game-appropriate language for cutting ("sent home," not "destroyed"/"killed"); large pawn tap targets (≥48px equivalent in 3D hit-testing); friends-only multiplayer by default |

### 2.2 The Design Tension We're Resolving

The Traditionalist wants **fidelity**. The Casual Gamer wants **immediacy**. These aren't opposed if we separate two layers:

- **Layer 1 — The Board (sacred, unchanging):** geometry, colors-as-meaning, dice shape, safe-zone marks. This layer is where authenticity lives and is never simplified.
- **Layer 2 — The Chrome (adaptive, modern):** onboarding, affordances, feedback, motion, typography. This layer is where we're allowed to be a well-made modern app.

This split is the single organizing idea behind everything that follows.

---

## 3. Design Principles (specific to this product)

1. **The board is the hero, always.** No screen should compete with it visually. UI chrome recedes; the board and pieces carry the color and light.
2. **Material honesty.** Every surface reads as a real material — aged brass, chalked stone, polished wood, cast shadow — never a flat gradient standing in for depth.
3. **One ceremonial motion, not many decorative ones.** The dice roll is the emotional peak of every turn — it gets the most craft. Everything else (menu transitions, card taps) is quick and restrained.
4. **Say what happened, plainly.** "Red pawn sent home" beats "Red pawn eliminated!" A cut is a setback in a family game, not a kill.
5. **Two people should be able to play this on one phone without either feeling like a second-class player.** Symmetric, readable-from-any-angle design for pass-and-play.
6. **Never block play to explain play.** Teaching happens beside the board, not instead of it.

---

## 4. Design Token System

### 4.1 Why not the "default AI palette"

We're deliberately avoiding: warm-cream-with-terracotta (now a recognizable AI tell), near-black-with-acid-accent, and the SaaS rounded-card-with-soft-shadow kit. Instead, the palette is sourced directly from the **physical materials of the game**: the red-oxide cement floor it's traditionally drawn on, rice-flour kolam chalk, aged brass dice, and temple-textile pawn colors. Nothing here is a trend color — it's a material color.

### 4.2 Color

| Token | Hex | Source material | Usage |
|---|---|---|---|
| `--floor-oxide` | `#7C3B2E` | Red-oxide cement floor (kal-manai) | App shell background (light mode), board surround |
| `--floor-oxide-dark` | `#4A211A` | Oxide floor in shadow | Dark-mode shell background |
| `--kolam-chalk` | `#F4EEDD` | Rice-flour kolam chalk | Board lines, primary text on dark, safe-zone marks |
| `--brass` | `#AD8A4E` | Cast brass Daayam dice | Primary CTA, dice material base, active-turn ring |
| `--brass-bright` | `#D9B876` | Polished brass highlight | Hover/pressed states, dice roll glow |
| `--pawn-red` | `#B2312F` | Kumkum vermilion | Player 1 |
| `--pawn-green` | `#4B7A46` | Banana-leaf green | Player 2 |
| `--pawn-yellow` | `#D9A22A` | Turmeric | Player 3 |
| `--pawn-blue` | `#2E4C74` | Temple indigo | Player 4 |
| `--stone-ink` | `#2A2320` | Wet basalt | Body text (light mode) |

**Rejected direction (documented for the record):** A cream-and-terracotta "warm minimalist" palette was drafted first, as the safest option — and cut, because it's the exact palette most generated designs default to, and because it flattens the game's actual materials (oxide red is much deeper and cooler than terracotta; kolam chalk is closer to bone/rice than cream).

### 4.3 Typography

| Role | Typeface | Rationale |
|---|---|---|
| **Display (English)** | Fraunces (optical size: display, weight 500–600) | A serif with ink-trap warmth and slightly irregular curves — reads as hand-associated/crafted rather than corporate, without becoming decorative |
| **Display (Tamil)** | Catamaran (weight 700) | One of the few families with genuinely matched Latin + Tamil metrics, avoiding the common failure mode of Tamil rendering as an afterthought font swap |
| **UI / Body (both scripts)** | Catamaran (weight 400–600) | Doubles as the workhorse UI font so English and Tamil UI never feel like two different products stitched together |
| **Numerals (dice values, scores)** | Fraunces tabular, or a monospace *only* if testing shows tabular Fraunces misaligns | Numbers should feel weighty and ceremonial, not like a data label |

Type scale follows a **1.25 modular ratio**, base 16px, with generous line-height (1.5) on body and tighter (1.1–1.15) on display sizes. Line lengths capped at ~70 characters for rules/tutorial text.

**Avoided defaults:** no all-caps eyebrow labels, no single-word-in-italic headline accenting, no tracked-out micro-labels above every heading. Hierarchy is carried by size, weight, and the brass rule-line, not by decorative labels.

### 4.4 Layout Concept

```
HOME SCREEN                          MATCH SCREEN (mobile portrait)
┌─────────────────────────┐          ┌─────────────────────────┐
│  தாயம்  Thayam           │          │  ●Red  turn   🎲 tap    │
│  (brass rule-line)       │          │                         │
│                          │          │   ╔═══ 3D BOARD ═══╗    │
│   [ Play vs AI ]         │          │   ║  (60–70% of     ║    │
│   [ Pass & Play ]        │          │   ║   viewport      ║    │
│   [ Play Online ]        │          │   ║   height)       ║    │
│   [ Learn to Play ]      │          │   ╚═════════════════╝    │
│                          │          │                         │
│  small 3D board preview, │          │  [pawn tray / legal     │
│  slow idle rotation      │          │   move chips]           │
└─────────────────────────┘          └─────────────────────────┘
```

- **Alignment:** left-aligned text throughout (not centered) — this is a game, not a poster; left alignment keeps rules/labels scannable mid-match.
- **The board is never boxed in a card with a drop shadow.** It sits directly on the floor-oxide background, edge-lit, as if placed on the actual floor. This is the clearest single way to avoid the "SaaS card kit" look.
- Chrome (buttons, turn indicator, dice tray) is anchored to screen edges, out of the board's visual footprint, so the board reads as one continuous object.

---

## 5. The 3D System

This is the product's signature investment, so it gets its own section with explicit engineering constraints — 3D done badly (laggy, gratuitous, disconnected from the rules) is worse than no 3D.

### 5.1 What is 3D, and what stays flat

| Element | Treatment | Why |
|---|---|---|
| Board | Full 3D, fixed high-angle camera (~55–65° from horizontal), slight perspective | Gives the grid physical presence — carved stone, not a spreadsheet |
| Dice (Daayam) | Full 3D, physically simulated roll (rigid-body physics, real cuboid mass/inertia) | This is the emotional centerpiece of every turn — see 5.3 |
| Pawns | Full 3D, cast in a glass/stone-hybrid material per player color, with real contact shadows | Legibility + tactility; each color must be readable from the fixed camera angle |
| Safe-zone marks, path arrows | Etched/inlaid into the board mesh (normal-mapped, not decals) | Reinforces "carved stone" material honesty from 4.2 |
| UI chrome (menus, buttons, rules panel) | Flat 2D, screen-space | 3D UI chrome is a common over-reach; keeping chrome flat keeps it fast, accessible, and legible |

### 5.2 Camera

- **Default:** fixed 3/4 top-down camera per-player-perspective in pass-and-play (the view rotates 90° per player's turn on a shared device, so each player always reads the board "toward" their own home — a real nod to how the physical game is played sitting around a floor board).
- **No free-orbit camera in v1.** Free orbit invites disorientation and is an engineering/QA surface we don't need to own yet. A single tap-and-hold "peek" tilt (±15°) is allowed for inspecting a contested square.
- Camera transitions between turn-rotations are eased over 400ms — this is one of the product's few animated camera moves, so it's tuned carefully rather than left as an engine default.

### 5.3 The dice roll — the one ceremonial moment

Per Principle 3, this gets outsized craft budget:

1. Player taps the dice tray. Two brass Daayam cuboids drop from a fixed height with real physics (gravity, angular momentum, floor friction/restitution tuned so they don't bounce absurdly).
2. Settle time target: **900ms–1.3s** — long enough to feel earned, short enough not to fatigue over a 20-turn match.
3. Result reads clearly: pip faces are large, high-contrast-engraved (not printed decals), and the camera holds still (no crash-zoom) so the result is legible without extra UI.
4. A subtle brass rim-light pulse confirms the read value, doubling as the accessibility-friendly non-color cue for colorblind users.
5. On a bonus roll (1, 5, 6, 12), the dice tray itself gets a restrained brass glow and re-enables — no confetti, no sound sting stack; the reward is *getting to act again*, not a decoration layer on top of it.

### 5.4 Materials & Lighting

- **Lighting model:** one dominant warm key light (simulating late-afternoon verandah light), soft fill, no colored rim lights except the brass turn-indicator glow. This keeps the palette disciplined even in 3D, where it's easy to let materials/lighting reintroduce a generic "game engine" look.
- **Pawns:** a cast-glass/stone hybrid BRDF — matte body, subtle specular highlight, so color reads as pigment-in-material rather than glossy-plastic-toy.
- **Board:** normal-mapped stone/cement texture at the base, chalk-white inlay for grid lines and safe-zone crosses, very slight ambient occlusion in grid grooves for physical presence.
- **Cut animation:** the captured pawn lifts, tips onto its side, and slides off-board toward its owner's off-board tray — echoing being physically picked up off a floor board, not "exploding" or "dissolving."

### 5.5 Performance Tiers (deployment-grade requirement)

3D is opt-in by device capability, never a gate to playing:

| Tier | Trigger | Behavior |
|---|---|---|
| **Full 3D** | WebGL2/Metal/Vulkan available, device passes a runtime perf probe | Full physics dice, real-time shadows, all above |
| **Reduced 3D** | Mid-tier device or `prefers-reduced-motion` not set but perf probe borderline | Baked/animated (non-physics) dice roll, static shadow maps, same materials |
| **2D Fallback** | Low-end device, WebGL unavailable, or `prefers-reduced-motion: reduce` | Flat top-down board illustration matching the same palette/iconography, instant dice-value reveal with a simple flip animation |

**Hard budget:** first meaningful board render ≤ 2.5s on a mid-tier Android device on 4G; steady-state ≥ 30fps on the 3D board during a dice roll. If a build misses this, it ships on Reduced 3D, not Full 3D, until fixed — this is a release gate, not a nice-to-have.

---

## 6. Core UX Flows

### 6.1 First-Turn-as-Tutorial (replaces slideshow onboarding)

Rather than a slideshow of rules (bounces the Casual Gamer persona), the first match against an easy AI *is* the tutorial:

1. Board loads with only the player's own home highlighted; everything else is present but visually quiet.
2. Dice tray pulses once (single orchestrated motion, not a looping pulse) — player rolls.
3. If they roll a 1: the entry-eligible pawn glows; a one-line contextual label appears *next to the pawn*, not in a modal: "Roll a 1 to bring a pawn in — tap it to enter."
4. If they don't roll a 1: a brief, dismissible note explains the reroll/bonus condition inline, then hands control back immediately.
5. This contextual pattern (glow + one-line label anchored to the relevant board element) is the **only** teaching mechanism used throughout — including later for cutting, safe zones, and inner-path unlock. Consistency here is what makes it feel like real UX rather than tacked-on help text.
6. A persistent, small "Rules" affordance (brass-outlined circle, bottom corner) opens the full bilingual reference for anyone who wants it — never forced.

### 6.2 Legal-move affordance (serves the Diaspora Reconnector persona directly)

- After every roll, eligible pawns get a soft brass outline pulse (one-time, not looping/distracting).
- Tapping a pawn that *can't* legally move (e.g., own-color-occupied destination, inner-path locked) doesn't just silently reject the tap — it shows a one-line reason at the pawn: *"Locked — cut an opponent's pawn first to unlock this path."* This single pattern eliminates most "why won't it let me move" confusion without any dedicated help screen.

### 6.3 Turn / bonus-roll indicator

- Persistent top-edge bar: current player's color chip + name, dice value, and (when applicable) a small "Roll again" brass tag.
- No modal interruptions for bonus rolls — the tag appears, the dice tray re-arms, play continues. Modals are reserved for match-level events only (win, disconnect, rematch offer).

### 6.4 Win screen

- Camera pulls back slightly (not a crash-zoom cutscene) to show the full board with the winner's 4 pawns settled at center.
- Copy: *"[Name] brought all four pawns home."* — plain, matches the "sent home" cutting language, no exclamation-mark inflation.
- Actions: Rematch (same players/settings, one tap), Share result, Back to home. No forced rating prompts or upsells on this screen.

### 6.5 Error / empty states

- **Disconnect (online match):** "Connection lost. Reconnecting…" with a determinate countdown to the grace-period limit, then, if exceeded: "Match ended — [Player] disconnected," with a rematch-invite action. Never a generic "Something went wrong."
- **No matchmaking opponent found:** "No one's free to play right now — invite a friend or play the AI instead," with both actions inline. An empty state is an invitation to act, per house style, not a dead end.

---

## 7. Component Language (avoiding the "SaaS card kit")

- **No single border-radius applied globally.** Radius is meaningful: dice tray and pawns use organic/rounded forms (physical objects); rule panels and menus use a single small radius (4px) applied consistently to *that* family only, distinct from the board's zero-radius carved-stone edges.
- **No uniform soft drop-shadow under everything.** Shadows are directional and tied to the single key light defined in 5.4 — a menu card's shadow should imply the same light source as the board's.
- **Buttons:** primary action = solid brass fill, kolam-chalk text, no gradient overlay; secondary = brass-outline on transparent. No ghost-button-with-arrow-suffix pattern.
- **Icons:** custom-drawn, line-based, matching the etched-board-inlay linework (path arrows, safe-zone cross) rather than a generic icon-font set — the iconography should look like it belongs on the same board.

---

## 8. Motion Principles

Per Principle 3, motion budget is spent deliberately:

| Moment | Motion | Why it earns the budget |
|---|---|---|
| Dice roll | Full physics settle, ~1s | The game's emotional core (Section 5.3) |
| Pawn move | Smooth arc-hop along the path, speed scaled to distance (not fixed duration) | Communicates distance/path intuitively |
| Cut | Lift, tip, slide off (Section 5.4) | Reinforces the "sent home," not "destroyed," framing |
| Turn-camera rotation (pass-and-play) | 400ms eased rotation | Functional — reorients the next player |
| Menu / screen transitions | Fast (150–200ms) cross-fade only | Deliberately unremarkable — this is not where the product's personality lives |
| Legal-move highlight | Single pulse, then settles to steady outline | Avoids the generic "everything gently breathes" over-animation tell |

`prefers-reduced-motion` disables the dice physics flourish (falls to Reduced/2D tier per 5.5), the camera rotation (cuts instantly), and the highlight pulse (shows steady state only) — gameplay-critical information is never conveyed by motion alone.

---

## 9. Accessibility & Inclusive Design

- **Color is never the only signal.** Player identity is also carried by pawn silhouette accents (a small etched glyph per color, echoing the four home-square markers) and by name/label text — required for colorblind users given the game is fundamentally 4-color.
- **Tap targets:** minimum effective hit-area equivalent to 48×48dp for every pawn and dice tray, even though visually a pawn may render smaller on dense boards — hit-testing radius is generous and independent of render size.
- **Text scaling:** UI (Catamaran) layer supports OS-level dynamic type up to at least 130% without truncation; board/game-state text (dice value, turn indicator) is never the only place critical info lives, so scaling it doesn't break comprehension.
- **Screen reader support:** every board state change (pawn entered, pawn moved N squares, pawn cut, turn passed) is announced via a live region in plain language matching on-screen copy — "Red pawn moved 4 squares," "Blue pawn sent home."
- **Language:** Tamil and English are both first-class, selected at first launch, switchable anytime — not an English-default with Tamil buried in settings.

---

## 10. Deployment-Grade Engineering Notes

This section exists so "design.md" doubles as a build contract, not just a mood board.

- **Rendering stack:** WebGL2 (three.js/react-three-fiber or equivalent) for web + shared-shader approach for native (iOS/Android) so the 3D asset pipeline (models, textures, materials) is authored once and consumed by both.
- **Asset budget:** board mesh + textures ≤ 6MB compressed; each pawn model ≤ 400KB; dice model + physics collider ≤ 300KB. Total first-load 3D payload ≤ 8MB, lazy-loaded after UI shell paints.
- **Testing matrix:** the three performance tiers (5.5) must each have automated visual-regression snapshots and a manual QA pass before any release; a release cannot ship if Full-3D tier drops below the 30fps steady-state budget on the reference mid-tier device.
- **Design tokens as code:** all values in Section 4.2–4.3 live in a single shared tokens file (JSON/CSS custom properties) consumed by both the flat UI layer and the 3D material definitions, so a palette change never has to be made in two places.
- **Localization pipeline:** all UI strings (English/Tamil) sourced from a single key-based i18n file from day one, including the contextual teaching strings in 6.1–6.2 — these are the strings most likely to be missed if localization is bolted on later.
- **Visual QA against Section 3:** every new screen is checked against the "board is the hero" and "material honesty" principles before merge — a lightweight design-review checklist (Section 11) formalizes this.

---

## 11. Anti-Genericness Checklist (use before every design review)

- [ ] Does any screen use the cream/terracotta or near-black/acid-accent palette this document explicitly rejected? *(Section 4.2)*
- [ ] Is there a single border-radius or shadow style applied uniformly regardless of what the element is? *(Section 7)*
- [ ] Is there a tracked-out ALL-CAPS eyebrow label, a middle-dot-joined meta string, or an em-dash label anywhere? *(Section 4.3)*
- [ ] Does every card/section have the same fade-and-slide-up entrance animation? *(Section 8 — motion should be deliberate, not uniform)*
- [ ] Is the board ever placed inside a bordered card with a drop shadow, rather than sitting directly on the shell background? *(Section 4.4)*
- [ ] Does any copy use "eliminate/destroy/kill" language for cutting, contradicting the family-appropriate tone in Section 2.1/6.4?
- [ ] Is Tamil treated as a secondary/settings-buried language anywhere in the flow? *(Section 9)*

If any box is unchecked, the screen goes back for revision before it's considered deployment-ready.

---

## 12. Open Design Questions for Stakeholder Input

1. Should the "peek tilt" camera (Section 5.2) be extended to a limited free-orbit in a future version once QA capacity allows, or kept fixed permanently as part of the product's identity?
2. Should online multiplayer expose opponents' full names/photos, or default to color-only identity (Red/Green/Yellow/Blue) to keep the family-safe framing consistent even against strangers?
3. Does the brand want a distinct Tamil-script wordmark treatment for app icons/marketing, separate from the in-app Catamaran display usage?

---

*End of Document*