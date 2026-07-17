import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

type ChipColor = 'blue' | 'lavender' | 'green' | 'rose'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
    color?: ChipColor
}

const chipColorMap: Record<ChipColor, string> = {
    blue: 'border-marina/40 bg-marina/10 text-marina-deep',
    lavender: 'border-petal-plush/50 bg-petal-plush/15 text-petal-plush-deep',
    green: 'border-bowser-shell/30 bg-bowser-shell/10 text-bowser-shell',
    rose: 'border-briar-rose/40 bg-briar-rose/10 text-briar-rose',
}

export function Chip({ className, children, color = 'lavender', ...props }: ChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-3 py-1.5 text-xs',
                chipColorMap[color],
                className
            )}
            {...props}
        >
      {children}
    </span>
    )
}