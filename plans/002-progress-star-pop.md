# 002 — Pop the progress star when a question is answered

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: MEDIUM
- **Category**: Missed opportunity (state indication)
- **Estimated scope**: 1 file, ~15 lines

## Problem

`PlaySession` (inside `app/(protected)/play/page.tsx`) shows one star per question, filling in as the player progresses. The fill/color swap happens with no transition — it's the only piece of feedback confirming "you moved forward" and it currently just snaps.

`app/(protected)/play/page.tsx:186-201` (current):

```tsx
const currentIndex = state.questionIndex

return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-6">
        <BackButton />

        <div className="flex justify-center gap-1.5">
            {questions.map((_, i) => (
                <Star
                    key={i}
                    className={i <= currentIndex ? 'h-4 w-4 text-changeling' : 'h-4 w-4 text-wild-hillside'}
                    fill={i <= currentIndex ? 'currentColor' : 'none'}
                    aria-hidden="true"
                />
            ))}
        </div>
```

## Target

```tsx
const currentIndex = state.questionIndex

return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-6">
        <BackButton />

        <div className="flex justify-center gap-1.5">
            {questions.map((_, i) => {
                const isFilled = i <= currentIndex
                return isFilled ? (
                    <motion.div
                        key={`${i}-filled`}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Star className="h-4 w-4 text-changeling" fill="currentColor" aria-hidden="true" />
                    </motion.div>
                ) : (
                    <Star key={`${i}-empty`} className="h-4 w-4 text-wild-hillside" fill="none" aria-hidden="true" />
                )
            })}
        </div>
```

Why `key={`${i}-filled`}` / `key={`${i}-empty`}` instead of `key={i}`: a star only ever transitions unfilled → filled once, never back. Keying on the filled state means React mounts a **new** `motion.div` the instant a star becomes filled (replaying `initial → animate` exactly once), then keeps that same instance for all subsequent re-renders (`currentIndex` moving further only affects stars after it — this star's key doesn't change again). This avoids the star replaying its pop every time the player answers a *later* question.

## Repo conventions to follow

- `duration: 0.3, ease: 'easeOut'` matches `components/ui/StaggerItem.tsx:11` (`transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}`) — reuse this exact pair, don't invent a new duration.
- Scale-based feedback pops elsewhere in the repo use the `pop` keyframe (`app/globals.css:20-26`, `--animate-pop: pop 0.3s ease-out`, `0% scale(1) → 45% scale(1.06) → 100% scale(1)`). This plan intentionally uses a framer-motion `initial`/`animate` pair instead of the CSS class, because the CSS `animate-pop` class replays from the start every time it's re-applied — exactly the interruptibility problem this plan avoids by using the stable-key mount trick. Do not swap this back to the `animate-pop` class.
- `Star` is already imported at the top of `app/(protected)/play/page.tsx:4` (`import { Star } from 'lucide-react'`) — no new import needed for it.

## Steps

1. In `app/(protected)/play/page.tsx`, add `motion` to the existing framer-motion import. Check the current top-of-file imports first — if there is no `import { motion } from 'framer-motion'` yet in this file, add it; this file currently has no framer-motion import at all (verify with a search for `from 'framer-motion'` in this file before editing).
2. Replace the `<div className="flex justify-center gap-1.5">...</div>` block at lines 192-201 with the Target code above. `currentIndex` is already defined one line above this block (`app/(protected)/play/page.tsx:186`) — do not redefine it.
3. Leave every other star-related line (the `Chip`s below it, the `Card` for the question) untouched.

## Boundaries

- Do NOT touch `hooks/usePlaySession.ts` — this is a pure rendering change, the state machine driving `currentIndex` is correct as-is.
- Do NOT apply this same treatment to the `BoardPage`'s answered-tile checkmark — that's a separate finding with its own plan (`003-board-tile-check-spring.md`... actually see `plans/005-board-tile-check-spring.md`).
- Do NOT add sound or haptics here — `playCorrectChime()` already exists and is called elsewhere in this file for correctness feedback; this plan is visual-only.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors.
- **Feel check**: start a play session with at least 3 questions and answer them one at a time:
  - Confirm the star for the question you just answered pops (scales down from 1.25 to 1) the moment you land on the next question.
  - Confirm stars for questions answered *earlier* do not re-pop when you answer a *later* question.
  - Confirm unfilled (future) stars never animate.
  - In DevTools Animations panel, set playback to 10% and confirm the pop is a single smooth scale-down, not a snap.
  - Toggle `prefers-reduced-motion` (Rendering panel) — the scale pop should still be very small and quick; if it feels like a "movement" to you at 10% playback, that's expected to remain (a 0.25 scale delta is feedback, not motion sickness territory), but confirm nothing spins or translates.
- **Done when**: every star transition unfilled→filled plays exactly one pop, and re-answering later questions never replays an earlier star's pop.
