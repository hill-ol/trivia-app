# 005 — Spring in the answered-tile checkmark on the board

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: LOW
- **Category**: Missed opportunity (feedback)
- **Estimated scope**: 1 file, ~10 lines

## Problem

On `/board`, each answered tile gets a small `Check` badge in its corner. It currently renders with no transition — it's just there or not there, even though it appears the instant the player returns from answering a question (a moment that deserves a beat of feedback).

`app/(protected)/board/page.tsx:139-156` (current, relevant part):

```tsx
<button
    key={cell.points}
    disabled={isEmpty || isAnswered}
    onClick={() => cell.question && setActiveQuestion(cell.question)}
    className={cn(
        'relative flex h-14 cursor-pointer items-center justify-center rounded-lg border text-lg font-semibold transition-transform active:scale-[0.96] disabled:cursor-default',
        isEmpty && 'border-wild-hillside/20 bg-wild-hillside/5 text-wild-hillside/40',
        isAnswered && 'border-bowser-shell/20 bg-bowser-shell/5 text-bowser-shell/40',
        !isEmpty && !isAnswered && TILE_STYLES[pointsChipColor(cell.points)]
    )}
>
    {isEmpty ? '—' : cell.points}
    {isAnswered && (
        <Check className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-bowser-shell p-0.5 text-white" />
    )}
</button>
```

## Target

```tsx
<button
    key={cell.points}
    disabled={isEmpty || isAnswered}
    onClick={() => cell.question && setActiveQuestion(cell.question)}
    className={cn(
        'relative flex h-14 cursor-pointer items-center justify-center rounded-lg border text-lg font-semibold transition-transform active:scale-[0.96] disabled:cursor-default',
        isEmpty && 'border-wild-hillside/20 bg-wild-hillside/5 text-wild-hillside/40',
        isAnswered && 'border-bowser-shell/20 bg-bowser-shell/5 text-bowser-shell/40',
        !isEmpty && !isAnswered && TILE_STYLES[pointsChipColor(cell.points)]
    )}
>
    {isEmpty ? '—' : cell.points}
    {isAnswered && (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -right-1.5 -top-2"
        >
            <Check className="h-4 w-4 rounded-full bg-bowser-shell p-0.5 text-white" />
        </motion.div>
    )}
</button>
```

Note: the badge's own `initial`/`animate` will only play once per mount — since each answered tile only transitions `isAnswered: false → true` one time (there's no way to un-answer a tile), a bare `motion.div` without a stable-key remount trick is sufficient here (unlike `plans/002-progress-star-pop.md`, where the same list index cycles through the render tree repeatedly). The `-top-2` (was `-top-1.5`) compensates for the extra wrapping `div` shifting the visual position by the border radius — verify visually in the Feel check step and adjust back to `-top-1.5` if the badge looks offset after wrapping.

## Repo conventions to follow

- `{ type: 'spring', stiffness: 400, damping: 20 }` is the exact spring config already used for small UI pops in `components/ui/Tooltip.tsx:29` and `components/ui/NavRow.tsx:60,67` — reuse it verbatim, do not invent a new spring.
- `scale: 0.5` (not `scale: 0`) as the initial value follows this repo's own physicality rule already applied in `components/ui/Card.tsx` and `components/ui/TapSparkles.tsx:41` (`initial={{ opacity: 0, scale: 0.4, rotate: 0 }}`) — never animate from `scale: 0`.
- `motion` is already imported in `app/(protected)/board/page.tsx:4` (`import { motion, AnimatePresence } from 'framer-motion'`) — no new import needed.

## Steps

1. In `app/(protected)/board/page.tsx`, locate the `{isAnswered && (<Check .../>)}` block inside the tile `button` (around line 152-154).
2. Replace it with the `motion.div`-wrapped version shown in Target, moving the `absolute -right-1.5 -top-1.5` positioning classes onto the new wrapping `motion.div` (adjusted to `-top-2` as shown, or kept at `-top-1.5` if that looks correct after your own visual check — see note above) and leaving `h-4 w-4 rounded-full bg-bowser-shell p-0.5 text-white` on the inner `Check` icon itself.

## Boundaries

- Do NOT change the tile's own `active:scale-[0.96]` press feedback — that's separate, already correct, and out of scope.
- Do NOT add this same treatment to the `isEmpty` state (the `—` placeholder) — only the answered checkmark badge is in scope.
- Do NOT touch `BoardTile`'s own answer-selection UI (the `animate-pop` class usage further down in the same file) — that's a separate, already-working piece of feedback.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors.
- **Feel check**: on `/board`, answer a question and return to the grid — confirm the checkmark badge springs in (slight overshoot then settle) rather than appearing instantly. Confirm its final position visually matches the pre-change badge position (top-right corner of the tile, not visibly offset).
- In DevTools Animations panel, set playback to 10% and confirm the spring shows a small overshoot-and-settle rather than a linear scale-up.
- **Done when**: every newly-answered tile's checkmark springs in, and its resting position/size is visually identical to the original static badge.
