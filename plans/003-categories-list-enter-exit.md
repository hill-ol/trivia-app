# 003 — Give the categories list the same enter/exit motion as my-questions

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Cohesion
- **Estimated scope**: 1 file, ~15 lines

## Problem

`app/(protected)/categories/page.tsx` renders its category rows with a bare `.map()` — no entrance or exit motion, so adding or deleting a category teleports the list. The sibling screen `app/(protected)/my-questions/page.tsx` solves the exact same problem (a list of deletable `Card` rows) with `AnimatePresence` + `layout`, so this app already has the correct, proven pattern — it just isn't applied here.

`app/(protected)/categories/page.tsx:99-102` (current):

```tsx
<div className="flex flex-col gap-3">
    {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

    {categories?.map((category) => (
        <Card key={category.id}>
```

...closing at line 178 (`</Card>`) then `))}` at line 179.

The proven pattern, `app/(protected)/my-questions/page.tsx:57-67`:

```tsx
<div className="flex flex-col gap-3">
    <AnimatePresence initial={false} mode="popLayout">
        {questions?.map((question) => (
            <motion.div
                key={question.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ layout: { duration: 0.25, ease: 'easeOut' }, opacity: { duration: 0.2 }, x: { duration: 0.2 } }}
            >
                <Card className="flex flex-col gap-3">
```

## Target

`app/(protected)/categories/page.tsx` (target, replacing lines 99-102 and the corresponding closing tags):

```tsx
<div className="flex flex-col gap-3">
    {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

    <AnimatePresence initial={false} mode="popLayout">
        {categories?.map((category) => (
            <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ layout: { duration: 0.25, ease: 'easeOut' }, opacity: { duration: 0.2 }, x: { duration: 0.2 } }}
            >
                <Card key={category.id}>
                    {/* ...existing row content unchanged... */}
                </Card>
            </motion.div>
        ))}
    </AnimatePresence>
```

The row's inner content (the color dot, rename input, delete-confirm controls) does not change in this plan — only the wrapper around each `<Card>`.

## Repo conventions to follow

- Copy `app/(protected)/my-questions/page.tsx:57-116` as the exemplar — same `AnimatePresence` props (`initial={false} mode="popLayout"`), same `motion.div` props (`layout`, `initial`, `animate`, `exit`, `transition`), verbatim. Do not alter any of these values; the point of this plan is consistency, not a new recipe.
- `AnimatePresence` and `motion` are already imported in `app/(protected)/my-questions/page.tsx:5` (`import { motion, AnimatePresence } from 'framer-motion'`) but **not currently imported** in `app/(protected)/categories/page.tsx` — this file has no framer-motion import at all today (verify with a search for `from 'framer-motion'` before editing).

## Steps

1. In `app/(protected)/categories/page.tsx`, add `import { motion, AnimatePresence } from 'framer-motion'` near the top (alongside the existing `lucide-react` and `@/lib` imports).
2. Wrap the `categories?.map(...)` call in `<AnimatePresence initial={false} mode="popLayout">...</AnimatePresence>`, placed where the current bare `{categories?.map((category) => (` starts (line 102) through its closing `))}`.
3. Wrap each mapped `<Card key={category.id}>...</Card>` in a `<motion.div key={category.id} layout initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,x:24}} transition={{layout:{duration:0.25,ease:'easeOut'}, opacity:{duration:0.2}, x:{duration:0.2}}}>`. Move the `key` from `Card` to the new `motion.div` wrapper (React needs the key on the outermost mapped element); `Card` no longer needs its own `key` prop once wrapped, but leaving a duplicate `key` on the inner `Card` is harmless if you prefer not to touch that line — prefer removing it for cleanliness.
4. Do not touch the "new category" input row at the bottom of the file (`app/(protected)/categories/page.tsx:180-196`, the `<Card className="flex items-center gap-3">` for adding a new category) — that row is not part of the animated list and should not be wrapped.
5. Leave every prop and every line of content *inside* each `Card` untouched — this plan only changes what wraps the `Card`, not what's inside it. (The delete-confirm swap inside the card is a separate finding — see `plans/004-delete-confirm-crossfade.md` — do not attempt to fix it here.)

## Boundaries

- Do NOT modify `app/(protected)/my-questions/page.tsx` — it's already correct and is the reference, not a target.
- Do NOT change the delete/rename/create handlers (`startEditing`, `saveEdit`, `handleDelete`, `handleCreate`) — behavior is unchanged, this is animation-only.
- Do NOT add `layout` to the "new category" input card at the bottom — it isn't part of the reorderable/removable list.
- If the current file structure has drifted from the line numbers cited here (e.g. `categories/page.tsx` no longer matches the excerpt above), stop and report rather than guessing where to insert the wrapper.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors.
- **Feel check**: go to `/categories`:
  - Add a new category and confirm the new row fades/slides in from `y: -8` instead of appearing instantly.
  - Delete a category (through the existing confirm flow) and confirm the row fades out to the right (`x: 24`) instead of vanishing, and that rows below it slide up smoothly (the `layout` transition) rather than jumping.
  - Compare side-by-side with `/my-questions` doing the same add/delete — the feel should be identical.
  - In DevTools Animations panel, set playback to 10% and confirm the exit is a clean fade+slide, not an overlap/double-render glitch.
- **Done when**: adding and removing a category animates identically to adding/removing a question on `/my-questions`.
