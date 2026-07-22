# 008 — Replace `transition-all` with explicit properties on pressable elements

- **Status**: DONE
- **Commit**: 659e40e
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 4 files, 1 line each

## Problem

Four interactive elements use Tailwind's `transition-all`, which animates every animatable CSS property that changes (including layout-triggering ones), rather than the two properties actually intended (`transform` for the press-scale, `background-color`/`border-color`/`color` for the state-swap crossfade). This repo's own performance guidance is explicit: "`transition: all` animates unintended properties off-GPU — always a finding."

`components/ui/NavRow.tsx:49-55` (current):
```tsx
className={cn(
    'flex min-h-[44px] items-center gap-3 rounded-2xl border border-wild-hillside/40 bg-white p-4 transition-all duration-200 active:scale-[0.98]',
    accent.hoverBg,
    accent.hoverBorder,
    'hover:shadow-md',
    accent.hoverShadow
)}
```

`components/ProfilePicker.tsx:76-82` (current):
```tsx
className={cn(
    'relative flex min-h-[44px] w-full items-center gap-4 rounded-2xl border border-wild-hillside/40 bg-white p-4 text-left transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
    'group-hover:shadow-lg',
    accent.hoverBg,
    accent.hoverBorder,
    accent.hoverShadow
)}
```

`components/QuestionForm.tsx:303-309` (current):
```tsx
className={cn(
    'w-full cursor-pointer rounded-2xl p-4 text-lg font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed',
    isSubmitting && 'bg-marina/60 text-white',
    !isSubmitting && justSubmitted && 'animate-pop bg-bowser-shell text-white',
    !isSubmitting && !justSubmitted && isValid && 'bg-marina text-white',
    !isSubmitting && !justSubmitted && !isValid && 'bg-wild-hillside/40 text-ink-muted'
)}
```

`app/(protected)/play/page.tsx:126-129` (current):
```tsx
className={cn(
    'w-full cursor-pointer rounded-2xl p-4 text-lg font-medium transition-all active:scale-[0.98]',
    matchingQuestions.length > 0 ? 'bg-marina text-white' : 'bg-wild-hillside/40 text-ink-muted'
)}
```

## Target

Each of these swaps `transition-all` for the two Tailwind utility classes that name exactly what's animating: `transition-colors` (covers `background-color`, `border-color`, `color` — everything these class-swaps actually change) and `transition-transform` (covers the `active:scale-[...]` press feedback). Tailwind lets you combine both; keep the existing `duration-*` class where present (it applies to whichever `transition-*` utilities are present).

`components/ui/NavRow.tsx:49-55` (target):
```tsx
className={cn(
    'flex min-h-[44px] items-center gap-3 rounded-2xl border border-wild-hillside/40 bg-white p-4 transition-colors transition-transform duration-200 active:scale-[0.98]',
    accent.hoverBg,
    accent.hoverBorder,
    'hover:shadow-md',
    accent.hoverShadow
)}
```

`components/ProfilePicker.tsx:76-82` (target):
```tsx
className={cn(
    'relative flex min-h-[44px] w-full items-center gap-4 rounded-2xl border border-wild-hillside/40 bg-white p-4 text-left transition-colors transition-transform duration-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
    'group-hover:shadow-lg',
    accent.hoverBg,
    accent.hoverBorder,
    accent.hoverShadow
)}
```

`components/QuestionForm.tsx:303-309` (target):
```tsx
className={cn(
    'w-full cursor-pointer rounded-2xl p-4 text-lg font-medium transition-colors transition-transform active:scale-[0.98] disabled:cursor-not-allowed',
    isSubmitting && 'bg-marina/60 text-white',
    !isSubmitting && justSubmitted && 'animate-pop bg-bowser-shell text-white',
    !isSubmitting && !justSubmitted && isValid && 'bg-marina text-white',
    !isSubmitting && !justSubmitted && !isValid && 'bg-wild-hillside/40 text-ink-muted'
)}
```

`app/(protected)/play/page.tsx:126-129` (target):
```tsx
className={cn(
    'w-full cursor-pointer rounded-2xl p-4 text-lg font-medium transition-colors transition-transform active:scale-[0.98]',
    matchingQuestions.length > 0 ? 'bg-marina text-white' : 'bg-wild-hillside/40 text-ink-muted'
)}
```

## Repo conventions to follow

- This repo already uses targeted transition utilities elsewhere — e.g. `components/ui/Card.tsx`'s sibling components and `app/(protected)/categories/page.tsx:169` (`'cursor-pointer text-ink-muted transition-colors hover:text-briar-rose'`) and `app/(protected)/board/page.tsx:145` (`'transition-transform active:scale-[0.96]'`). This plan brings the four outliers in line with that existing convention — it introduces no new class names.
- Tailwind v4 (per `package.json:35`, `"tailwindcss": "^4"`) supports combining multiple `transition-*` utility classes on one element; each sets `transition-property` to its own value, and since Tailwind's generated CSS declares them independently, the later one in source order does not override the earlier one's `transition-property` — both are honored as separate longhand rules under the hood via CSS custom properties. This is the standard way to animate two unrelated property groups without `transition: all`.

## Steps

1. `components/ui/NavRow.tsx:50` — replace `transition-all` with `transition-colors transition-transform`.
2. `components/ProfilePicker.tsx:77` — replace `transition-all` with `transition-colors transition-transform`.
3. `components/QuestionForm.tsx:304` — replace `transition-all` with `transition-colors transition-transform`.
4. `app/(protected)/play/page.tsx:127` — replace `transition-all` with `transition-colors transition-transform`.

Do not change any other class in these `className`/`cn(...)` calls.

## Boundaries

- Do NOT touch any other `transition-*` usage in the repo — only these four confirmed `transition-all` instances (verified via a repo-wide search; if you find additional `transition-all` instances not listed here, stop and report them rather than fixing them under this plan, since they weren't part of the audited set).
- Do NOT change any `active:scale-*` values, durations, or hover-color classes — property names only.
- Do NOT add `will-change` or other performance hints — out of scope for this plan.

## Verification

- **Mechanical**: `npm run lint` and `npx tsc --noEmit` should pass with no new errors. Run `grep -rn "transition-all" components app` (or equivalent) and confirm zero remaining matches.
- **Feel check**: on `/home`, hover and press a `NavRow` — confirm the icon/border/shadow color transition and the press-scale both still animate smoothly, with no visible behavior change from before. Repeat for the profile-picker buttons (`/`), the question-submit button (`/add-trivia`), and the "Start playing" button (`/play`).
- In DevTools Performance panel, record a press-and-release on one of these buttons and confirm the "Layout" work is not triggered by the transition (only Composite/Paint for color, and Composite for transform).
- **Done when**: no `transition-all` remains in the four cited files, and every visual transition on those elements looks identical to before the change.
