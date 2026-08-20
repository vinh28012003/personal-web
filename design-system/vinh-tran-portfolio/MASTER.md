# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/vinh-tran-portfolio/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Vinh Tran Portfolio
**Stack:** Next.js 16.3.1 · React 19.2.8 · Tailwind v4 · TypeScript
**Generated:** 2026-08-20 by `ui-ux-pro-max --design-system --variance 9 --motion 4 --density 5`
**Reconciled:** 2026-08-20 against the shipped implementation
**Style:** Brutalism · **Mode:** light default + dark toggle · **Audience:** recruiters / hiring managers

---

## ⚠ Provenance — read this before trusting any value below

The generator produced a first draft. Every value in it was checked against the
implementation and against measured contrast. **Six fields were overridden.** The
values in this file are the shipped, verified ones.

| Field | Generator proposed | Shipped | Why overridden |
|---|---|---|---|
| Background | `#0F172A` dark slate | `#FAFAF7` paper, light default | User explicitly chose light-default + dark toggle |
| Accent | `#22C55E` green | `#FF3B00` blaze | Green reads as "success state", not as a brand mark; blaze verified at every usage |
| Heading font | JetBrains Mono | **Archivo** | Mono headings at 176px are illegible; JBM is data/labels only here |
| Body font | IBM Plex Sans | **Archivo** | One grotesque for display + body is the brutalist move; contrast comes from weight, not a second face |
| Page pattern | "FAQ/Documentation Landing" (search bar, FAQ accordion) | Portfolio grid | Wrong product type entirely |
| Shadows | Blurred `rgba()` ramp | Hard offset, zero blur | Blur contradicts brutalism's own "sharp corners / visible borders" spec |

**The generator's file also contradicted itself** and those contradictions are resolved here:
- Its Brutalism block says *"No smooth transitions (instant)"*; its Anti-Patterns say *"Instant state changes — always use transitions (150-300ms)."* Resolution in [Motion](#motion).
- Its Anti-Patterns list *"❌ Light mode default"*, which contradicts the user's stated requirement.

A separate note on the toolchain: the skill's `--design-system` output hands you a
Google Fonts `@import`. **Do not use it.** Next.js requires `next/font/google` for
zero-CLS font loading. Take only the family names.

---

## Colour

Every ratio below is computed, not estimated. Re-verify with the contrast sweep in
[Verification](#verification) after any palette change.

### Light (default)

| Role | Token | Hex | Ratio | Rule |
|---|---|---|---|---|
| Background | `--paper` | `#FAFAF7` | — | Paper, not `#FFF` — kills OLED halation at 96px+ |
| Surface | `--surface` | `#FFFFFF` | — | Card interiors |
| Foreground | `--ink` | `#0A0A0A` | **18.93:1** | All body and display type |
| Muted | `--muted` | `#5E5E58` | **6.24:1** | Dates, locations, captions. **Never a fact a recruiter needs** |
| Accent | `--accent` | `#FF3B00` | **3.42:1** | ⚠ **Background, border, and display type ≥24px ONLY** |
| Accent text | `--accent-text` | `#C42D00` | **5.39:1** | The only accent value legal on small text and links |
| On accent | `--accent-fg` | `#0A0A0A` | **5.54:1** | Text on an accent fill |
| Focus ring | `--focus` | `#FF3B00` | **3.42:1** | Clears the 3:1 non-text gate |

### Dark (toggle)

Two tokens **must** change or they fail AA:

| Role | Light | Dark | Dark ratio | If not swapped |
|---|---|---|---|---|
| Muted | `#5E5E58` | `#9C9C96` | **7.17:1** | 3.86:1 ✗ |
| Accent text | `#C42D00` | `#FF3B00` | **5.54:1** | 3.51:1 ✗ |

In dark mode the accent clears 4.5:1 outright, so `--accent-text` collapses onto
`--accent`. One semantic token, two primitives per theme.

### The inverted context — the trap that already bit once

An inverted block (proof strip, contact, project metric bar) swaps ground and
foreground. **No component may hardcode `text-ink` / `bg-paper`.** Doing so
rendered the GitHub and LinkedIn buttons as `#0A0A0A` on `#0A0A0A` — 1:1, fully
invisible, and the heuristic audit did not catch it.

Components resolve against the ground pair instead:

```css
:root      { --ground: paper; --on-ground: ink;   }
.dark      { --ground: ink;   --on-ground: paper; }
.inverted  { --ground: var(--ink); --on-ground: var(--paper);
             --muted: var(--muted-inverted); --accent-text: var(--accent-text-inverted); }
```

Use `text-on-ground`, `hover:bg-on-ground hover:text-ground`. Never `text-ink`
inside anything that could be inverted.

### Hierarchy test

Strip all colour and the hierarchy must survive intact — it is carried by **size,
border weight, and position**. Accent is only ever redundant reinforcement on
something already larger and already bordered.

---

## Typography

**Archivo** (display + body) + **JetBrains Mono** (data, labels, code).
Load via `next/font/google`, subsets `latin`, `latin-ext`, **`vietnamese`** (required
for correct diacritics in the name).

| Family | Variable axes | Why |
|---|---|---|
| **Archivo** | `wght 100..900` + `wdth 62..125` | Reaches 900 **and** has a width axis for the hero |
| **JetBrains Mono** | `wght 100..800` | The only face allowed to render a number |
| ~~Space Grotesk~~ | `wght 300..700` | **Rejected** — cannot reach the 900 brutalism requires |
| ~~Space Mono~~ | *(none — static)* | **Rejected** — not variable |

### Scale

| Level | Family / weight | Mobile | Desktop | LH | Tracking |
|---|---|---|---|---|---|
| Hero | Archivo 900, `wdth 125` | 52 | 176 | 0.86 | −0.04em |
| H1 | Archivo 800 | 40 | 72 | 0.95 | −0.03em |
| H2 | Archivo 800 | 32 | 52 | 1.00 | −0.02em |
| H3 | Archivo 700 | 24 | 32 | 1.10 | −0.015em |
| Body | Archivo 400 | **17** | 18 | 1.60 | 0 |
| Label | JBM 700 | 12 | 13 | 1.20 | +0.14em |
| Metric | JBM 700, tabular | 28 | 44 | 1.00 | −0.01em |

Hero: `clamp(3.25rem, 13vw, 11rem)`. **"VINH" / "TRAN" are hard-broken into
explicit lines** — at `wdth 125` the full string is ~437px and overflows 375px.
Never left to natural wrapping.

Measure: `max-width: 38ch` mobile / `68ch` desktop. Body is 17px so it clears the
16px floor with headroom for the `swap` fallback.

---

## Spacing, borders, elevation

- **Spacing:** `--spacing: 0.25rem` in `@theme`. Tailwind v4 derives the whole ramp from it, so the 4/8 rule is enforced by the framework rather than by discipline.
- **Radius:** every `--radius-*` token is `0`. `rounded-lg` literally emits `0` — removes an entire class of drift.
- **Borders:** exactly **2px or 4px**, never 1px. All of them come from the single `Slab` primitive. This precision is what separates "brutalist" from "broken".
- **Elevation — exactly three, no others.** Zero blur, zero alpha, zero spread:

| Token | Value | Usage |
|---|---|---|
| `--shadow-0` | `none` | Default |
| `--shadow-slab` | `4px 4px 0 0 var(--rule)` | Cards, buttons at rest |
| `--shadow-slab-lg` | `8px 8px 0 0 var(--rule)` | Hero CTA + sticky résumé only |

Any other shadow value is a bug.

- **z-index:** `0 / 10 / 20 / 40 / 100 / 1000` (base / raised / sticky / overlay / modal / skip).
- **Breakpoints:** 375 / 768 / 1024 / 1440.

---

## Motion

### Resolving the contradiction

Brutalism says `transition: none`. The a11y gate demands feedback within 100ms.
**These describe different events, so both hold:**

| Category | Rule | Rationale |
|---|---|---|
| **State feedback** (hover, active, focus, copy) | **0ms, `transition: none`** | 0ms is the *strongest possible* pass of "≤100ms" — brutalism and a11y point the same way |
| **Entrance** (scroll reveal) | ≤220ms, transform + opacity, fires once | Brutalism forbids smoothing *interaction*, not content arriving |

### Library: GSAP for route entry only — everything else is CSS

**Revised 2026-08-20.** The original decision was "no library". GSAP was added for
route transitions only; Framer Motion is still rejected (every `motion.div` forces
`'use client'` up the tree and detonates the server-first architecture). Scroll
reveal, 3D and all state feedback remain pure CSS.

| Animation | Trigger | Property | Duration |
|---|---|---|---|
| Section reveal | IO, first intersection only | opacity + `translateY(16px)` | 200ms |
| Card stagger | same IO | same | 40ms/item, **capped at 6** |
| **Route entry** | mount / pathname change | opacity + `translateY(10px)` | **240ms `power1.inOut`** |
| **3D card tilt** | `:hover` / `:focus-within` | `transform` only | **120ms linear** |
| Hover / press / focus | `:hover` `:active` `:focus-visible` | colour swap, `translate: 3px 3px` | **0ms** |
| Dialog backdrop | `showModal()` | opacity | 120ms |

**Route entry is enter-only and never blocks navigation.** The skill's preset calls
`navigate()` from GSAP's `onComplete`; we deliberately do not, because correctness
must never depend on an animation-end event — and the preset's own note says "don't
block navigation on animation". If GSAP never loads, navigation is instant and the
content is already visible.

**The 120ms tilt is a deliberate exception to the 0ms rule.** 0ms governs *state*
changes (colour, fill). A spatial transform has to be traversed to read as spatial;
snapping it reads as a glitch. `linear` keeps it mechanical rather than organic.

**Banned:** marquee, jitter, parallax, cursor followers, number tick-up counters,
hover-scale, blur/shadow animation, any layout-property animation, WebGL.

### 3D — hard extrusion only

Brutalist depth is a solid seen at an angle, never a shaded surface. **Every layer
has zero blur and zero alpha.**

| Utility | What | Where |
|---|---|---|
| `.text-extruded` | Stacked `text-shadow` offsets in `em`, accent then rule | Hero only — the single signature element |
| `.scene` | `perspective: 1400px` | Parent of anything that tilts |
| `.slab-3d` | `preserve-3d` + tilt on hover | Project cards |

The tilt is gated on `@media (hover: hover) and (pointer: fine) and
(prefers-reduced-motion: no-preference)`. **"Hover effects don't work on touch
devices" is Severity HIGH**, so the tilt only reinforces an affordance that already
exists — the border, the hard shadow and the stretched link carry it alone.

Accent in `.text-extruded` is legal because the hero sits far above the 24px
large-text threshold where 3.42:1 passes.

### Correctness never depends on animation — three layers

1. The server renders the final state unconditionally.
2. `html.no-js` guard: the hiding CSS is scoped `html:not(.no-js)`, so JS-off shows everything with zero flash.
3. `prefers-reduced-motion` skips creating the observer entirely.
4. `@media print` forces `opacity: 1` — a non-scrolling consumer (print-to-PDF, crawler, screenshot tool) would otherwise capture blank sections.

---

## Components

- **`Slab`** — the *one* bordered-box primitive. Every visible border comes from it.
- **`Button`** — `primary` (accent fill, the single CTA per screen) / `secondary` / `ghost`. Renders `next/link` for internal hrefs, `<a target="_blank" rel="noreferrer">` + sr-only "(opens in new tab)" for external, `<button>` otherwise. Min 48px tall, 44px wide.
- **`Metric`** — required `plain` field carries the screen-reader sentence, so a metric physically cannot ship without one. The delta arrow is **inline SVG, not a `→` glyph** (the glyph renders inconsistently during the font swap window). Metric boxes use `min-w`, never a fixed `w` — the delta form overflowed a fixed 11rem box.
- **Icons** — one hand-authored set, 24×24, `currentColor`, **all stroke-width 2**, `aria-hidden` unless meaningful. **Zero emoji anywhere.**
- **Client components — six files, and no more without a reason:**
  - Four interactive leaves: `Reveal`, `MobileNav` (native `<dialog>` + `showModal()` for a free focus trap), `CopyEmail`, `ThemeToggle`
  - Two framework-required: `ThemeProvider` (next-themes wrapper), `app/error.tsx` (Next.js mandates it)

  Everything else is a Server Component. `Reveal` takes its `children` as a prop from a
  Server Component parent, so the children stay server-rendered and only the ~1KB wrapper
  ships. Push client boundaries to leaves — never mark a page `'use client'`.

---

## Anti-patterns

- ❌ Hardcoding `text-ink` / `bg-paper` in a component — breaks inside inverted blocks
- ❌ Any shadow with blur, alpha, or spread
- ❌ 1px borders, or any radius other than 0
- ❌ Emoji as icons; mixed icon sets; mixed stroke widths
- ❌ Accent `#FF3B00` on text under 24px (use `--accent-text`)
- ❌ Hierarchy expressed by colour alone
- ❌ More than one primary CTA per screen
- ❌ Fixed-width boxes around variable-width mono content
- ❌ A metric without its `plain` sr-only sentence
- ❌ Trusting a heuristic audit over a screenshot

**Deliberately NOT anti-patterns here** (the generator listed these; they are wrong for this project):
- "Light mode default" — it is the chosen default
- "Instant state changes" — 0ms feedback is the requirement, not the violation
- "Missing cursor:pointer" — real `<button>`/`<a>` elements are used throughout, which is better than restyling a `<div>`

---

## Pre-delivery checklist

- [ ] Text contrast ≥4.5:1 (≥3:1 large) **in both themes independently**
- [ ] Every focusable shows a 3px ring — verify with **real Tab presses against a production build**, not programmatic `.focus()`
- [ ] Touch targets ≥44×44 (stretched-link cards count as the whole card)
- [ ] Zero horizontal scroll at 320px and 375px
- [ ] JS disabled: all content visible, nothing stranded at opacity 0
- [ ] `prefers-reduced-motion`: final state rendered immediately
- [ ] Zoom not disabled
- [ ] Zero console errors
- [ ] No emoji; one icon set; one stroke width
- [ ] **Look at a full-resolution screenshot** — three real bugs on this project passed the automated audit and were only visible by eye

---

## Verification

```bash
# Multi-viewport heuristic pass (360/390/768/1024/1440/1920)
node scripts/design-audit.mjs --url http://localhost:3000 --out audit-output

# Token hygiene — flags hardcoded hex/px
node <design-tooling>/scripts/validate-tokens.cjs --dir src/ -i .next
```

**Known false positives from `design-audit.mjs`:**
- `focus-visible` HIGH — it uses programmatic `.focus()`, which does not trigger `:focus-visible`. Verified 100% coverage via real Tab presses against `next start`.
- `tap-target` MEDIUM ×3 — the sr-only skip link (1×1 by design) and two card titles whose stretched `::after` makes the entire card clickable (confirmed by clicking the card corner).
- The dev-only `<nextjs-portal>` overlay appears as a focusable with no ring. It does not exist in production.
