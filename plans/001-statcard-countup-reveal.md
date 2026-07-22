# 001 — Animate StatCard value reveal with CountUp

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: MEDIUM
- **Category**: Missed opportunity (teleporting state)
- **Estimated scope**: 1 file, ~15 lines

## Problem

`StatCard` renders its `value` prop as plain text. On `Home` and `Profile`, the caller passes `'--'` while stats are loading and then a real number/string once `useProfileStats` resolves. That swap happens with **zero transition** — the digit just appears, which reads as a jump on a card the user is looking directly at.

`app/(protected)/home/page.tsx:46-52` (and the identical pattern in `app/(protected)/profile/page.tsx:96-113`):

```tsx
<StatCard
    icon={<BarChart3 className="h-3.5 w-3.5" />}
    label="Games played"
    value={isLoading || !stats ? '--' : stats.gamesPlayed}
    color="blue"
    sticker="marina"
/>
```

`components/ui/StatCard.tsx` (current, full file):

```tsx
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type StatCardColor = 'blue' | 'lavender'

interface StatCardProps {
    icon: ReactNode
    label: string
    value: string | number
    color?: StatCardColor
    sticker?: 'marina' | 'petal-plush'
}

const iconBgMap: Record<StatCardColor, string> = {
    blue: 'bg-marina/10 text-marina',
    lavender: 'bg-petal-plush/15 text-petal-plush-deep',
}

export function StatCard({ icon, label, value, color = 'blue', sticker }: StatCardProps) {
    return (
        <Card sticker={sticker} rotate={color === 'blue' ? -4 : 4}>
            <div className={cn('mb-2 flex h-6 w-6 items-center justify-center rounded-md', iconBgMap[color])}>
                {icon}
            </div>
            <p className="text-xs text-ink-muted">{label}</p>
            <p className="text-2xl font-medium text-ink">{value}</p>
        </Card>
    )
}
```

The app already has a purpose-built component for exactly this — `components/ui/CountUp.tsx` — but it is only used in the end-of-session score reveal (`app/(protected)/play/page.tsx:173`), never in `StatCard`.

## Target

`components/ui/StatCard.tsx` (target):

```tsx
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { CountUp } from '@/components/ui/CountUp'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type StatCardColor = 'blue' | 'lavender'

interface StatCardProps {
    icon: ReactNode
    label: string
    value: string | number
    color?: StatCardColor
    sticker?: 'marina' | 'petal-plush'
}

const iconBgMap: Record<StatCardColor, string> = {
    blue: 'bg-marina/10 text-marina',
    lavender: 'bg-petal-plush/15 text-petal-plush-deep',
}

export function StatCard({ icon, label, value, color = 'blue', sticker }: StatCardProps) {
    return (
        <Card sticker={sticker} rotate={color === 'blue' ? -4 : 4}>
            <div className={cn('mb-2 flex h-6 w-6 items-center justify-center rounded-md', iconBgMap[color])}>
                {icon}
            </div>
            <p className="text-xs text-ink-muted">{label}</p>
            <motion.p
                key={String(value)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-2xl font-medium text-ink"
            >
                {typeof value === 'number' ? <CountUp value={value} /> : value}
            </motion.p>
        </Card>
    )
}
```

Behavior:
- When `value` is a `number` (the games-played case), swapping from `'--'` to the number remounts the inner `<CountUp>` (different child type), which runs its existing `animate(0, value, { duration: 0.8, ease: 'easeOut' })` — the digit rolls up instead of popping in.
- When `value` is a `string` (the accuracy `"92%"` case, and the `'--'` placeholder itself), the `motion.p`'s `key={String(value)}` changes on every distinct value, remounting the paragraph and replaying `initial → animate` — a 200ms opacity fade, no movement.

## Repo conventions to follow

- `CountUp` already exists at `components/ui/CountUp.tsx` and is used exactly this way in `app/(protected)/play/page.tsx:172-174`:
  ```tsx
  <p className="font-display text-4xl text-ink">
      <CountUp value={score} /> / {questions.length}
  </p>
  ```
  Import it the same way; do not create a second counting implementation.
- The "remount via changing `key` to replay an entrance" pattern is already used in this repo for full-section swaps, e.g. `app/(protected)/board/page.tsx:82-104` (`key="tile"` / `key="grid"` on an `AnimatePresence` child). Here it's applied at the paragraph level instead of a whole section — same idea, smaller scope.
- Duration `0.2` + `ease: 'easeOut'` matches `components/PageTransition.tsx:35` (`transition={{ duration: 0.2, ease: 'easeOut' }}`) — reuse this exact value rather than inventing a new one.

## Steps

1. Add `'use client'` as the first line of `components/ui/StatCard.tsx` (it currently has no directive; adding `motion.p` requires it to run on the client).
2. Add `import { motion } from 'framer-motion'` and `import { CountUp } from '@/components/ui/CountUp'` to the top of `components/ui/StatCard.tsx`.
3. Replace the final `<p className="text-2xl font-medium text-ink">{value}</p>` line with the `motion.p` block shown in Target above.
4. Do not change `app/(protected)/home/page.tsx` or `app/(protected)/profile/page.tsx` — both already pass `value` in a shape this handles (`number` when loaded, `string` for `'--'` and for the `%`-suffixed accuracy).

## Boundaries

- Do NOT touch `hooks/useProfileStats.ts` or any data-fetching logic — this is a display-only change.
- Do NOT change `CountUp.tsx` itself.
- Do NOT add a loading skeleton or spinner — that's a separate concern from this fix.
- If `StatCard` is used anywhere else with a `value` shape you don't recognize (grep for `<StatCard` first), stop and report instead of guessing new behavior for it.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should both pass with no new errors.
- **Feel check**: run the app, go to `/home` with dev tools throttled (Network tab, "Slow 3G") so the loading state is visible, then:
  - Confirm "Games played" rolls up from 0 to its final value over ~0.8s instead of popping in.
  - Confirm "Accuracy" fades in over ~0.2s instead of snapping from `'--'` to `"92%"`.
  - Confirm neither transition causes the card to jump in height or width (no layout shift).
  - In DevTools' Animations panel, set playback to 10% and confirm the count-up is a smooth roll, not a discrete jump partway through.
- **Done when**: reloading `/home` or `/profile` on a cold cache shows both stat values animating in instead of appearing instantly, and repeated navigation to an already-cached page (SWR cache hit) shows no jarring re-animation of unchanged values (only the `key` changing — i.e. the value actually changing — should retrigger it).
