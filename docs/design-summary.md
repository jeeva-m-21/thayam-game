# Design Doc — Working Summary

> Extracted from `design.md` for quick agent reference. The design doc itself remains authoritative.

---

## Design Philosophy

- **Cultural authenticity** over generic gaming aesthetic
- Sourced from physical materials: red-oxide cement floor, rice-flour kolam chalk, aged brass dice, temple-textile pawn colors
- **Rejects:** cream/terracotta "warm minimalist" and near-black/acid-accent palettes as AI-generic tells

---

## Color Tokens (§4.2)

| Token | Hex | Source | Usage |
|-------|-----|--------|-------|
| `--floor-oxide` | `#7C3B2E` | Red-oxide cement floor | App shell bg (light), board surround |
| `--floor-oxide-dark` | `#4A211A` | Oxide floor in shadow | Dark-mode shell bg |
| `--kolam-chalk` | `#F4EEDD` | Rice-flour kolam chalk | Board lines, primary text on dark, safe marks |
| `--brass` | `#AD8A4E` | Cast brass dice | Primary CTA, dice material, active-turn ring |
| `--brass-bright` | `#D9B876` | Polished brass | Hover/pressed states, dice roll glow |
| `--pawn-red` | `#B2312F` | Kumkum vermilion | Player 1 |
| `--pawn-green` | `#4B7A46` | Banana-leaf green | Player 2 |
| `--pawn-yellow` | `#D9A22A` | Turmeric | Player 3 |
| `--pawn-blue` | `#2E4C74` | Temple indigo | Player 4 |
| `--stone-ink` | `#2A2320` | Wet basalt | Body text (light mode) |

---

## Typography Tokens (§4.3)

| Role | Typeface | Weight |
|------|----------|--------|
| Display (EN) | **Fraunces** (optical size: display) | 500–600 |
| Display (TA) | **Catamaran** | 700 |
| UI/Body (both) | **Catamaran** | 400–600 |
| Numerals | **Fraunces tabular** (fallback: monospace) | — |

**Scale:** 1.25 modular ratio, base 16px  
**Line-height:** 1.5 (body), 1.1–1.15 (display)  
**Max line-length:** ~70 characters  
**Avoided:** ALL-CAPS eyebrow labels, single-word italic accenting, tracked-out micro-labels

---

## Layout (§4.4)

- Left-aligned text throughout (not centered)
- Board sits directly on floor-oxide background — **never boxed in a card with drop shadow**
- Chrome anchored to screen edges, out of board's visual footprint
- Board takes **60–70%** of viewport height

---

## 3D System (§5)

### Elements

| Element | Treatment |
|---------|-----------|
| Board | Full 3D, carved stone look, high-angle camera (~55–65°) |
| Dice | Full 3D, physics-simulated roll, cuboid shape |
| Pawns | Full 3D, glass/stone-hybrid material per color |
| Safe marks, arrows | Etched/inlaid into board mesh (normal-mapped, NOT decals) |
| UI chrome | Flat 2D, screen-space |

### Camera (§5.2)
- Fixed 3/4 top-down, per-player perspective
- Pass-and-play: rotates 90° per turn (**400ms eased**)
- No free-orbit in v1, only tap-and-hold "peek" tilt (±15°)

### Dice Roll (§5.3) — "Ceremonial Moment"
1. Tap dice tray → two brass cuboids drop with real physics
2. **Settle: 900ms–1.3s**
3. Pip faces: large, high-contrast engraved (not decals)
4. Subtle brass rim-light pulse confirms read value
5. Bonus roll: dice tray gets restrained brass glow — **no confetti**

### Materials & Lighting (§5.4)
- **Key light:** warm, late-afternoon verandah light
- **Pawns:** cast-glass/stone hybrid BRDF, matte body, subtle specular
- **Board:** normal-mapped stone/cement, chalk-white inlay, AO in grooves
- **Cut animation:** lift, tip, slide off-board (NOT explosion/dissolve)

### Performance Tiers (§5.5)

| Tier | Trigger | Behavior |
|------|---------|----------|
| Full 3D | WebGL2 + perf probe passes | Full physics, real-time shadows |
| Reduced 3D | Mid-tier / borderline probe | Baked dice, static shadows |
| 2D Fallback | Low-end / no WebGL / `prefers-reduced-motion` | Flat top-down, same palette |

**Hard Budgets:**
- First render: ≤ **2.5s** mid-tier Android 4G
- Steady-state: ≥ **30fps** during dice roll
- Release gates, not aspirations

---

## UX Flows (§6)

### First-Turn-as-Tutorial (§6.1)
- First match against easy AI **is** the tutorial
- Teaching mechanism: **glow + one-line label anchored to element** (only pattern used)
- Persistent "Rules" affordance in bottom corner

### Legal-Move Affordance (§6.2)
- Eligible pawns: **soft brass outline pulse** (single, not looping)
- Ineligible tap: **one-line reason at the pawn** (never silent rejection)

### Turn/Bonus-Roll (§6.3)
- Persistent top-edge bar: color chip + name + dice value + "Roll again" tag
- **No modal for bonus rolls** — dice tray re-arms
- Modals only for match-level events

### Win Screen (§6.4)
- Camera pulls back slightly, full board visible
- "[Name] brought all four pawns home." — plain language
- Actions: Rematch, Share, Back to home — **no forced prompts**

### Disconnect UX (§6.5)
- "Connection lost. Reconnecting…" with countdown
- Grace period default: **30 seconds**
- Exceeded: "Match ended — [Player] disconnected" + rematch invite

---

## Motion Tokens (§8)

| Moment | Duration | Notes |
|--------|----------|-------|
| Dice roll | 900ms–1.3s | Physics settle |
| Pawn move | Distance-scaled | Arc-hop |
| Cut | ~600–800ms | Lift, tip, slide |
| Camera rotation | 400ms | Eased |
| Screen transitions | 150–200ms | Cross-fade only |
| Legal-move highlight | Single pulse → steady | No looping "breathe" |

**`prefers-reduced-motion`:** disable physics dice, snap camera, steady-only highlights, gameplay info never motion-only.

---

## Accessibility (§9)

1. **No color-only signals** — pawn identity also via etched glyph + name/label
2. **Tap targets:** ≥ **48×48dp** effective hit area
3. **Text scaling:** up to **130%** without truncation
4. **Screen reader:** live region announcements for every state change
5. **Language:** Tamil and English both first-class, selectable at launch

---

## Anti-Genericness Checklist (§11)

Before every screen review, verify NO:
- [ ] Cream/terracotta or near-black/acid-accent palette
- [ ] Uniform border-radius/shadow regardless of element
- [ ] ALL-CAPS eyebrow labels or em-dash labels
- [ ] Same fade-slide-up animation on everything
- [ ] Board in bordered card with drop shadow
- [ ] "Eliminate/destroy/kill" language for cutting
- [ ] Tamil as secondary/buried language

---

## Asset Budgets

| Asset | Budget |
|-------|--------|
| Board mesh + textures | ≤ 6MB compressed |
| Each pawn model | ≤ 400KB |
| Dice model + collider | ≤ 300KB |
| Total first-load 3D | ≤ 8MB, lazy-loaded after UI shell |

---

## Component Language (§7)

- No uniform border-radius or shadow
- Menu/rule panel: **4px** radius
- Board: **0px** radius (carved edges)
- Dice/pawns: organic/rounded
- Primary button: solid brass fill (`#AD8A4E`), kolam-chalk text, no gradient
- Secondary button: brass outline on transparent
- Shadows: directional, tied to single key light
- Icons: custom-drawn, line-based, matching etched-inlay linework
