# 004 — Crossfade the delete-confirm row swap instead of snapping

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: MEDIUM
- **Category**: Missed opportunity (preventing a jarring change)
- **Estimated scope**: 2 files, ~20 lines each

## Problem

Both `app/(protected)/categories/page.tsx` and `app/(protected)/my-questions/page.tsx` have a delete flow where clicking the trash icon replaces the row's right-hand controls (icon buttons) with a "Delete? Yes / Cancel" strip. Today this is a plain conditional render — the swap is instant and changes the row's content width abruptly.

`app/(protected)/categories/page.tsx:118-174` (current, relevant branch):

```tsx
{editingId === category.id ? (
    <>
        <button onClick={saveEdit} disabled={isSaving} aria-label="Save" className="cursor-pointer text-ink disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button onClick={() => setEditingId(null)} disabled={isSaving} aria-label="Cancel" className="cursor-pointer text-ink-muted disabled:cursor-not-allowed disabled:opacity-50">
            <X className="h-4 w-4" />
        </button>
    </>
) : confirmingId === category.id ? (
    <div className="flex items-center gap-2 text-xs">
        <span className="text-briar-rose">Delete?</span>
        <button onClick={() => handleDelete(category)} disabled={deletingId === category.id} className="flex cursor-pointer items-center gap-1 font-medium text-briar-rose underline disabled:cursor-not-allowed">
            {deletingId === category.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
        </button>
        <button onClick={() => setConfirmingId(null)} disabled={deletingId === category.id} className="cursor-pointer text-ink-muted disabled:cursor-not-allowed">
            Cancel
        </button>
    </div>
) : (
    <>
        <button onClick={() => startEditing(category)} disabled={deletingId !== null} aria-label="Rename" className="cursor-pointer text-ink-muted disabled:cursor-not-allowed disabled:opacity-50">
            <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => setConfirmingId(category.id)} disabled={deletingId !== null} aria-label="Delete" className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose disabled:cursor-not-allowed disabled:opacity-50">
            <Trash2 className="h-4 w-4" />
        </button>
    </>
)}
```

`app/(protected)/my-questions/page.tsx:83-109` (current, same problem, only two branches — no rename state):

```tsx
{confirmingId === question.id ? (
    <div className="flex items-center gap-2 text-xs">
        <span className="text-briar-rose">Delete?</span>
        <button onClick={() => handleDelete(question.id)} disabled={deletingId === question.id} className="flex cursor-pointer items-center gap-1 font-medium text-briar-rose underline disabled:cursor-not-allowed">
            {deletingId === question.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
        </button>
        <button onClick={() => setConfirmingId(null)} disabled={deletingId === question.id} className="cursor-pointer text-ink-muted disabled:cursor-not-allowed">
            Cancel
        </button>
    </div>
) : (
    <button onClick={() => setConfirmingId(question.id)} aria-label="Delete question" className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose">
        <Trash2 className="h-4 w-4" />
    </button>
)}
```

## Target

Wrap each conditional branch's *outermost* returned element in `AnimatePresence mode="wait"` with a fast, fully symmetric fade. Since this swap happens inside a flex row (not a route or modal), keep the motion to opacity only — no vertical/horizontal offset, to avoid the row visibly jumping while both states are momentarily present.

`app/(protected)/my-questions/page.tsx` target (simpler file, shown first since it has one fewer branch):

```tsx
<AnimatePresence mode="wait" initial={false}>
    {confirmingId === question.id ? (
        <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex items-center gap-2 text-xs"
        >
            <span className="text-briar-rose">Delete?</span>
            <button onClick={() => handleDelete(question.id)} disabled={deletingId === question.id} className="flex cursor-pointer items-center gap-1 font-medium text-briar-rose underline disabled:cursor-not-allowed">
                {deletingId === question.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
            </button>
            <button onClick={() => setConfirmingId(null)} disabled={deletingId === question.id} className="cursor-pointer text-ink-muted disabled:cursor-not-allowed">
                Cancel
            </button>
        </motion.div>
    ) : (
        <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={() => setConfirmingId(question.id)}
            aria-label="Delete question"
            className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose"
        >
            <Trash2 className="h-4 w-4" />
        </motion.button>
    )}
</AnimatePresence>
```

`app/(protected)/categories/page.tsx` target — same treatment, but there are three mutually-exclusive branches (`editingId === category.id`, `confirmingId === category.id`, default). Give each branch a stable `key` (`"editing"`, `"confirm"`, `"default"`) and the identical `initial`/`animate`/`exit`/`transition` values as above. The default branch (rename + delete icon pair) needs to become a single `motion.div` wrapping the two existing buttons (currently a bare `<>...</>` fragment — fragments can't carry `key` or animation props, so it must become a real element):

```tsx
<AnimatePresence mode="wait" initial={false}>
    {editingId === category.id ? (
        <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center gap-2">
            <button onClick={saveEdit} disabled={isSaving} aria-label="Save" className="cursor-pointer text-ink disabled:cursor-not-allowed disabled:opacity-50">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button onClick={() => setEditingId(null)} disabled={isSaving} aria-label="Cancel" className="cursor-pointer text-ink-muted disabled:cursor-not-allowed disabled:opacity-50">
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    ) : confirmingId === category.id ? (
        <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center gap-2 text-xs">
            <span className="text-briar-rose">Delete?</span>
            <button onClick={() => handleDelete(category)} disabled={deletingId === category.id} className="flex cursor-pointer items-center gap-1 font-medium text-briar-rose underline disabled:cursor-not-allowed">
                {deletingId === category.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
            </button>
            <button onClick={() => setConfirmingId(null)} disabled={deletingId === category.id} className="cursor-pointer text-ink-muted disabled:cursor-not-allowed">
                Cancel
            </button>
        </motion.div>
    ) : (
        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center gap-2">
            <button onClick={() => startEditing(category)} disabled={deletingId !== null} aria-label="Rename" className="cursor-pointer text-ink-muted disabled:cursor-not-allowed disabled:opacity-50">
                <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => setConfirmingId(category.id)} disabled={deletingId !== null} aria-label="Delete" className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose disabled:cursor-not-allowed disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
            </button>
        </motion.div>
    )}
</AnimatePresence>
```

Note the added `className="flex items-center gap-2"` on the "editing" and "default" wrappers — this replaces the implicit inline layout the `<>` fragment previously got for free from the parent's own `flex` container; without it the Save/Cancel (or Rename/Delete) buttons would stack instead of sitting side by side. Verify the parent row's existing `flex items-center gap-3` (the outer row `div`) still lines things up correctly after this change — if spacing looks off, that gap-2 on the inner wrapper is additive to the parent's gap-3, which is intentional (matches the original two-button horizontal layout).

## Repo conventions to follow

- `AnimatePresence mode="wait"` is already used in this exact way for a full-screen swap in `app/(protected)/board/page.tsx:81` (`<AnimatePresence mode="wait">`) — same prop, smaller scope here.
- `duration: 0.15` sits inside the "tooltips, small popovers" budget (125–200ms) from this repo's own `Tooltip.tsx`-adjacent conventions; this swap is even smaller than a tooltip, so staying at the low end of that budget is correct — do not go above 200ms.
- `AnimatePresence` and `motion` need importing in `app/(protected)/categories/page.tsx` (not currently imported — this plan can run before or after `plans/003-categories-list-enter-exit.md`, but if both are applied, only add the import once).

## Steps

For `app/(protected)/my-questions/page.tsx` (already imports `motion, AnimatePresence` from `framer-motion` at line 5):
1. Replace the conditional block at lines 83-109 with the Target code shown above.

For `app/(protected)/categories/page.tsx`:
1. Add `import { motion, AnimatePresence } from 'framer-motion'` if not already present from `plans/003-categories-list-enter-exit.md`.
2. Replace the three-way conditional at lines 118-174 with the Target code shown above.
3. Confirm the parent element still wraps this in a `<div className="flex items-center gap-3">` (it does, at line 104) — do not change that wrapper.

## Boundaries

- Do NOT change any handler logic (`saveEdit`, `handleDelete`, `startEditing`, `setConfirmingId`, etc.) — purely wrapping existing JSX in motion primitives.
- Do NOT add exit/enter offsets (`x`/`y`) to this swap — the row's height and position must stay fixed; only `opacity` should animate, to avoid a bigger jump than the one being fixed.
- Do NOT apply this pattern to the "new category" creation row — it has no such state swap.
- If `app/(protected)/categories/page.tsx`'s current line numbers no longer match the excerpt in Problem (e.g. because `plans/003-categories-list-enter-exit.md` was already applied and shifted lines), locate the same conditional block by its `editingId === category.id` / `confirmingId === category.id` structure rather than by line number.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors.
- **Feel check**: on `/categories`, click the trash icon on a row and confirm the icon pair crossfades to "Delete? Yes Cancel" without a visible snap or layout jump; click Cancel and confirm it crossfades back. Repeat on `/my-questions`. Also test the rename flow on `/categories` (pencil icon) crossfading to Save/Cancel.
- Confirm rapid double-clicking the trash icon then Cancel then trash again doesn't produce overlapping/stuck states (AnimatePresence `mode="wait"` should serialize these cleanly).
- In DevTools Animations panel, set playback to 10% and confirm both states never render fully opaque at the same time (the "wait" mode should prevent double-exposure).
- **Done when**: the delete-confirm (and rename, on categories) row swap fades instead of snapping, on both `/categories` and `/my-questions`.
