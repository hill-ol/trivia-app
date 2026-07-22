# 006 — Add prefers-reduced-motion support to ambient/decorative motion

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 7 files, small edits each

## Problem

A repo-wide search for `reduced-motion` / `prefers-reduced-motion` returns **zero results**. Meanwhile this app runs several animations that are exactly the category `prefers-reduced-motion` exists for:

1. **Infinite ambient loops**, running continuously (not user-triggered) on the most-visited screens:
   - `lib/motion.ts:1` — `FLOAT_TRANSITION = { duration: 3, repeat: Infinity, ease: 'easeInOut' }`, used for a floating sticker behind cards. Call sites: `components/ui/Card.tsx:38-39`, `app/(protected)/home/page.tsx:24-29`, `app/(protected)/profile/page.tsx:63-68`, `app/(protected)/leaderboard/page.tsx:62-67`.
   - `components/ui/WobbleStar.tsx:6-12` — a separate, near-identical infinite loop (`duration: 2.5, repeat: Infinity, ease: 'easeInOut'`) rotating a star, used on `Home`, `Board`, `Leaderboard`, `Profile`, `ProfilePicker`.
   - Both run simultaneously on `/home`, `/profile`, and `/leaderboard` — two concurrent infinite transforms, indefinitely, on screens the user returns to constantly.
2. **Route-level translation on every navigation** — `components/PageTransition.tsx:6-17` moves content by `y: 8`/`x: 48` on every single page change, app-wide, with no accommodation.
3. **Global click-triggered motion** — `components/ui/TapSparkles.tsx` animates `scale`/`opacity`/`rotate` on a spawned particle for every tap on any `button, a, .cursor-pointer` in the entire app (`document.addEventListener('click', ...)` at `components/ui/TapSparkles.tsx:30`).
4. **Celebratory particle bursts** — `components/ui/Celebration.tsx` radiates 6 stars outward (`x`/`y`/`scale`/`rotate`) on a great score or full board completion.

None of these check `prefers-reduced-motion`. Per this app's own audit guidance, reduced motion means **fewer and gentler animations, not zero** — remove position/movement, keep opacity-based feedback.

## Target

Use Framer Motion's built-in `useReducedMotion()` hook (already available — it ships with the `framer-motion` package already installed at `^12.42.2`; no new dependency). It returns `true` when the OS-level "reduce motion" preference is set.

### `components/ui/WobbleStar.tsx` (current → target)

Current:
```tsx
'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const WOBBLE_TRANSITION = { duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } as const

export function WobbleStar({ className = 'h-3.5 w-3.5 text-changeling' }: { className?: string }) {
    return (
        <motion.div className="inline-flex" animate={{ rotate: [-20, -8, -20] }} transition={WOBBLE_TRANSITION}>
            <Star className={className} fill="currentColor" aria-hidden="true" />
        </motion.div>
    )
}
```

Target:
```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'

const WOBBLE_TRANSITION = { duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } as const

export function WobbleStar({ className = 'h-3.5 w-3.5 text-changeling' }: { className?: string }) {
    const shouldReduceMotion = useReducedMotion()
    return (
        <motion.div
            className="inline-flex"
            animate={shouldReduceMotion ? { rotate: -14 } : { rotate: [-20, -8, -20] }}
            transition={shouldReduceMotion ? { duration: 0 } : WOBBLE_TRANSITION}
        >
            <Star className={className} fill="currentColor" aria-hidden="true" />
        </motion.div>
    )
}
```

### `components/ui/Card.tsx` (the floating sticker)

Current (lines 33-44):
```tsx
return (
    <div className="relative">
        <motion.div
            className={cn('absolute inset-0 rounded-2xl', stickerColorMap[sticker])}
            initial={{ rotate }}
            animate={{ rotate, y: [0, -3, 0] }}
            transition={FLOAT_TRANSITION}
            aria-hidden="true"
        />
        {cardEl}
    </div>
)
```

Target:
```tsx
return (
    <div className="relative">
        <motion.div
            className={cn('absolute inset-0 rounded-2xl', stickerColorMap[sticker])}
            initial={{ rotate }}
            animate={{ rotate, y: shouldReduceMotion ? 0 : [0, -3, 0] }}
            transition={shouldReduceMotion ? { duration: 0 } : FLOAT_TRANSITION}
            aria-hidden="true"
        />
        {cardEl}
    </div>
)
```
Add `const shouldReduceMotion = useReducedMotion()` inside the `Card` function body (near the top, alongside the existing destructured props), and add `useReducedMotion` to the existing `import { motion } from 'framer-motion'` line.

### `app/(protected)/home/page.tsx`, `app/(protected)/profile/page.tsx`, `app/(protected)/leaderboard/page.tsx` (the inline floating blob/crown)

Each has an identical shape, e.g. `app/(protected)/home/page.tsx:23-30`:
```tsx
<motion.div
    className="absolute -right-2 -top-2 h-[68px] w-[68px] rounded-2xl bg-petal-plush"
    initial={{ rotate: 10 }}
    animate={{ rotate: 10, y: [0, -4, 0] }}
    transition={FLOAT_TRANSITION}
    aria-hidden="true"
/>
```
Target (same pattern in all three files):
```tsx
<motion.div
    className="absolute -right-2 -top-2 h-[68px] w-[68px] rounded-2xl bg-petal-plush"
    initial={{ rotate: 10 }}
    animate={{ rotate: 10, y: shouldReduceMotion ? 0 : [0, -4, 0] }}
    transition={shouldReduceMotion ? { duration: 0 } : FLOAT_TRANSITION}
    aria-hidden="true"
/>
```
`app/(protected)/leaderboard/page.tsx:62-70` (the floating crown) gets the identical treatment — same `y: shouldReduceMotion ? 0 : [0, -3, 0]` and `transition={shouldReduceMotion ? { duration: 0 } : FLOAT_TRANSITION}` swap, applied to its `motion.div` wrapping the `Crown` icon.

Each of these three page files needs `const shouldReduceMotion = useReducedMotion()` added inside its component function, and `useReducedMotion` added to that file's existing `import { motion } from 'framer-motion'` line.

### `components/PageTransition.tsx`

Current (full file):
```tsx
'use client'

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const VARIANTS = {
    default: {
        initial: { opacity: 0, y: 8},
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    },
    push: {
        initial: { opacity: 0, x: 48 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -24 },
    },
}

function getVariant(pathname: string) {
    if (pathname.startsWith("/categories") || pathname.includes('/edit')) return VARIANTS.push
    return VARIANTS.default
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const variant = getVariant(pathname)

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={variant.initial}
                animate={variant.animate}
                exit={variant.exit}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
```

Target:
```tsx
'use client'

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const VARIANTS = {
    default: {
        initial: { opacity: 0, y: 8},
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    },
    push: {
        initial: { opacity: 0, x: 48 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -24 },
    },
}

const REDUCED_VARIANT = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

function getVariant(pathname: string) {
    if (pathname.startsWith("/categories") || pathname.includes('/edit')) return VARIANTS.push
    return VARIANTS.default
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const shouldReduceMotion = useReducedMotion()
    const variant = shouldReduceMotion ? REDUCED_VARIANT : getVariant(pathname)

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={variant.initial}
                animate={variant.animate}
                exit={variant.exit}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
```
This keeps the opacity fade between routes (so navigation still reads as a change) but drops the positional slide, per this app's own "fewer and gentler, not zero" rule.

### `components/ui/Celebration.tsx`

Current (lines 15-31, full component):
```tsx
export function Celebration() {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {PARTICLES.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${p.color}`}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.rotate }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.04, ease: 'easeOut' }}
                >
                    <Star className="h-4 w-4" fill="currentColor" />
                </motion.div>
            ))}
        </div>
    )
}
```

Target:
```tsx
export function Celebration() {
    const shouldReduceMotion = useReducedMotion()
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {PARTICLES.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${p.color}`}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                    animate={
                        shouldReduceMotion
                            ? { opacity: [0, 1, 0], scale: 1 }
                            : { opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.rotate }
                    }
                    transition={{ duration: 1, delay: 0.15 + i * 0.04, ease: 'easeOut' }}
                >
                    <Star className="h-4 w-4" fill="currentColor" />
                </motion.div>
            ))}
        </div>
    )
}
```
Add `useReducedMotion` to the existing `import { motion } from 'framer-motion'` line. Under reduced motion, particles still flash in place (opacity feedback preserved for the "you did great" moment) but don't radiate outward or spin.

### `components/ui/TapSparkles.tsx`

This is the most aggressive case — it fires on every tap anywhere in the app. Under reduced motion, don't spawn sparkles at all (this is pure decoration with zero functional purpose, unlike the celebration burst which marks a real achievement):

Current (lines 15-33, the component body before the return):
```tsx
export function TapSparkles() {
    const [sparkles, setSparkles] = useState<Sparkle[]>([])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement
            if (!target.closest('button, a, .cursor-pointer')) return

            const id = nextId++
            setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
            setTimeout(() => {
                setSparkles((prev) => prev.filter((s) => s.id !== id))
            }, 700)
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])
```

Target:
```tsx
export function TapSparkles() {
    const shouldReduceMotion = useReducedMotion()
    const [sparkles, setSparkles] = useState<Sparkle[]>([])

    useEffect(() => {
        if (shouldReduceMotion) return

        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement
            if (!target.closest('button, a, .cursor-pointer')) return

            const id = nextId++
            setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
            setTimeout(() => {
                setSparkles((prev) => prev.filter((s) => s.id !== id))
            }, 700)
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [shouldReduceMotion])
```
Add `useReducedMotion` to the existing `import { motion } from 'framer-motion'` line.

## Repo conventions to follow

- `useReducedMotion` is imported from `'framer-motion'` — the same package already used everywhere in this repo (`^12.42.2` per `package.json:16`). Do not add a new dependency or write a custom `matchMedia` hook.
- The `{ duration: 0 }` transition override (used for `WobbleStar`, `Card`, and the three page blobs) is the simplest way to make an `animate` prop resolve instantly without removing the prop's static values (e.g. `rotate: 10` still applies, just without the oscillation) — this matches the "keep opacity/color feedback, drop movement" rule from this repo's own audit guidance, applied here to "keep static rotation, drop oscillation."

## Steps

1. `components/ui/WobbleStar.tsx` — apply the Target diff shown above.
2. `components/ui/Card.tsx` — add `useReducedMotion` import and `const shouldReduceMotion = useReducedMotion()`, apply the Target diff to the sticker `motion.div`.
3. `app/(protected)/home/page.tsx` — add `useReducedMotion` import and the hook call inside `HomePage`, apply the Target diff to the floating blob `motion.div` at lines 24-29.
4. `app/(protected)/profile/page.tsx` — same as step 3, applied to the identical blob at lines 63-68.
5. `app/(protected)/leaderboard/page.tsx` — add `useReducedMotion` import and the hook call inside `LeaderboardPage`, apply the same `y`/`transition` swap to the crown `motion.div` at lines 62-67 (uses `y: [0, -3, 0]`, matching `Card.tsx`'s value, not the `-4` used on Home/Profile — keep each file's existing magnitude, only swap in the reduced-motion branch).
6. `components/PageTransition.tsx` — apply the full Target rewrite shown above (adds `REDUCED_VARIANT` and the `shouldReduceMotion` branch).
7. `components/ui/Celebration.tsx` — add `useReducedMotion` import and hook call, apply the Target diff to the `animate` prop.
8. `components/ui/TapSparkles.tsx` — add `useReducedMotion` import and hook call, apply the Target diff (early-return inside the effect, dependency array update).

## Boundaries

- Do NOT touch `components/ui/Squiggle.tsx` in this plan — it has its own dedicated plan (`plans/007-squiggle-duration-fix.md`) that also handles its reduced-motion gating alongside a duration/easing correction; doing it here too would conflict.
- Do NOT touch `components/ui/CountUp.tsx` or `components/ui/StaggerItem.tsx` — a 0.3-0.8s one-shot entrance/count that finishes and stops is not the kind of sustained/looping motion this plan targets, and is not disorienting the way infinite loops or global click-triggered motion are. Leave them as-is.
- Do NOT remove the `TapSparkles` component or change its non-reduced-motion behavior — this plan only gates it, it doesn't judge whether the feature itself should exist (see the note in the accompanying audit about its tap-frequency).
- Do NOT change `Celebration`'s trigger conditions (`isGreatScore`, `showBoardCelebration`) — only its internal motion values.
- If any of the cited files have drifted since commit `659e40e` such that the current code doesn't match the "Current" excerpts above, stop and report rather than guessing.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors.
- **Feel check**: in Chrome DevTools, open the Rendering tab and set "Emulate CSS media feature prefers-reduced-motion" to `reduce`, then:
  - Visit `/home`, `/profile`, `/leaderboard` and confirm the floating sticker/crown/blob no longer oscillates (it can still sit at its static rotated angle, just not moving).
  - Confirm `WobbleStar` no longer rotates back and forth.
  - Navigate between pages and confirm content still fades in (opacity) but no longer slides (`y`/`x` offset gone).
  - Tap several buttons/links and confirm no sparkle particles spawn.
  - Trigger a great-score finish or full board completion and confirm the celebration still flashes (opacity feedback) without stars flying outward.
  - Switch the emulation back to "No emulation" and confirm every one of the above animations behaves exactly as before this plan (full motion restored) — this plan must be a no-op for users without the OS preference set.
- **Done when**: every animation touched in this plan behaves identically to today under normal settings, and drops movement (retaining opacity feedback where applicable) under `prefers-reduced-motion: reduce`.
