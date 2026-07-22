# 007 — Shorten and correct the Squiggle draw-in, add reduced-motion gate

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: MEDIUM
- **Category**: Easing & duration / Accessibility
- **Estimated scope**: 1 file, ~15 lines

## Problem

`components/ui/Squiggle.tsx` draws its underline stroke via `pathLength: 0 → 1` over **0.8s** with `ease: 'easeInOut'`. Two problems:

1. **Duration**: 0.8s is well over this repo's own UI budget (under 300ms; even "modals, drawers" only go up to 500ms). This is a small decorative underline, not a modal.
2. **Easing direction**: per this repo's own easing decision order, an *entering* element should use `ease-out` (starts fast, feels responsive); `easeInOut` is for things moving/morphing on screen. A stroke drawing itself in is an entrance, not an on-screen move.
3. **Frequency**: `Squiggle` is rendered on `Home` (`app/(protected)/home/page.tsx:37`), `Profile` (`app/(protected)/profile/page.tsx:82`), `Board` (`app/(protected)/board/page.tsx:114`), and `ProfilePicker` (`components/ProfilePicker.tsx:57`). Because `components/PageTransition.tsx` unmounts/remounts route content on every navigation (`key={pathname}` + `AnimatePresence mode="wait"`), `Squiggle` replays its full draw-in animation every single time the user lands on `Home` — the most-visited screen in the app. At that frequency, an 0.8s animation is felt as sluggishness, not delight.
4. No `prefers-reduced-motion` handling.

`components/ui/Squiggle.tsx` (current, full file):

```tsx
'use client'

import { motion } from 'framer-motion'

interface SquiggleProps {
    className?: string
    width?: number
}

export function Squiggle({ className = 'text-marina', width = 110 }: SquiggleProps) {
    return (
        <svg width={width} height="10" viewBox="0 0 110 10" preserveAspectRatio="none" className={className} aria-hidden="true">
            <motion.path
                d="M2,6 Q17,0 32,6 T62,6 T92,6 T110,6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
        </svg>
    )
}
```

## Target

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface SquiggleProps {
    className?: string
    width?: number
}

export function Squiggle({ className = 'text-marina', width = 110 }: SquiggleProps) {
    const shouldReduceMotion = useReducedMotion()

    return (
        <svg width={width} height="10" viewBox="0 0 110 10" preserveAspectRatio="none" className={className} aria-hidden="true">
            <motion.path
                d="M2,6 Q17,0 32,6 T62,6 T92,6 T110,6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
            />
        </svg>
    )
}
```

Two independent changes bundled here since they touch the same three lines: the duration/easing correction (`0.8s easeInOut` → `0.3s easeOut`), and the reduced-motion branch (render the path already fully drawn, no animation, when the OS preference is set).

## Repo conventions to follow

- `duration: 0.3, ease: 'easeOut'` matches the exact pair used in `components/ui/StaggerItem.tsx:11` and (per `plans/002-progress-star-pop.md`) the play-session star pop — this repo's standard "small UI entrance" timing. Reuse it rather than picking a new value.
- `useReducedMotion` from `'framer-motion'` — same hook introduced in `plans/006-reduced-motion-support.md` for the rest of the app's ambient motion. If that plan has already been applied, this is the same import pattern; if not, this plan introduces it independently for this file (the two plans don't share a file, so order doesn't matter between them).

## Steps

1. Add `useReducedMotion` to the existing `import { motion } from 'framer-motion'` line in `components/ui/Squiggle.tsx`.
2. Add `const shouldReduceMotion = useReducedMotion()` as the first line inside the `Squiggle` function body.
3. Change `initial={{ pathLength: 0 }}` to `initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}`.
4. Change `transition={{ duration: 0.8, ease: 'easeInOut' }}` to `transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}`.
5. Leave `animate={{ pathLength: 1 }}` unchanged.

## Boundaries

- Do NOT change the `d` path, `strokeWidth`, colors, or any caller (`Home`, `Profile`, `Board`, `ProfilePicker`) — this is a self-contained internal change to `Squiggle.tsx` only.
- Do NOT gate this component from re-animating on navigation (e.g. by lifting state, memoizing, or persisting across route changes) — that would be a bigger structural change than this plan's scope. This plan only makes the *replay itself* fast and correctly-eased; it does not stop the replay from happening.
- Do NOT merge this into `plans/006-reduced-motion-support.md` — that plan explicitly excludes this file to avoid two plans editing the same lines.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors.
- **Feel check**: navigate to `/home`, away, and back several times in a row:
  - Confirm the squiggle now draws in noticeably faster (~0.3s) and feels like it "snaps into place" rather than leisurely tracing.
  - In DevTools Animations panel, set playback to 10% and confirm the stroke draws left-to-right smoothly at the new duration.
  - Toggle `prefers-reduced-motion: reduce` (Rendering panel) and confirm the squiggle appears fully drawn immediately with no animation, on `/home`, `/profile`, `/board`, and the profile-picker screen (`/`).
  - Switch reduced-motion back off and confirm the normal 0.3s draw-in returns.
- **Done when**: the squiggle's draw-in is 0.3s with `ease-out` everywhere it's used, and is skipped entirely (rendered pre-drawn) under `prefers-reduced-motion: reduce`.
