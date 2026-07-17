import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, HTMLAttributes } from 'react'

type ChipColor = 'blue' | 'lavender' | 'green' | 'rose'

const chipColorMap: Record<ChipColor, string> = {
    blue: 'border-marina/40 bg-marina/10 text-marina-deep',
    lavender: 'border-petal-plush/50 bg-petal-plush/15 text-petal-plush-deep',
    green: 'border-bowser-shell/30 bg-bowser-shell/10 text-ink',
    rose: 'border-briar-rose/40 bg-briar-rose/10 text-briar-rose',
}

const chipSelectedColorMap: Record<ChipColor, string> = {
    blue: 'border-marina bg-marina text-white',
    lavender: 'border-petal-plush bg-petal-plush text-white',
    green: 'border-bowser-shell bg-bowser-shell text-white',
    rose: 'border-briar-rose bg-briar-rose text-white',
}

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
    color?: ChipColor
}

export function Chip({ className, children, color = 'lavender', ...props }: ChipProps) {
    return (
        <span
            className={cn('inline-flex items-center rounded-full border px-3 py-1.5 text-xs', chipColorMap[color], className)}
            {...props}
        >
      {children}
    </span>
    )
}

interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color?: ChipColor
    selected?: boolean
}

export function ChipButton({ className, children, color = 'lavender', selected = false, ...props }: ChipButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex min-h-[36px] cursor-pointer items-center rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                selected ? chipSelectedColorMap[color] : chipColorMap[color],
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}