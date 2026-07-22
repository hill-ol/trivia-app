'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FLOAT_TRANSITION } from '@/lib/motion'
import { HTMLAttributes } from 'react'

type StickerColor = 'marina' | 'petal-plush' | 'bowser-shell'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    sticker?: StickerColor
    rotate?: number
}

const stickerColorMap: Record<StickerColor, string> = {
    marina: 'bg-marina/30',
    'petal-plush': 'bg-petal-plush/60',
    'bowser-shell': 'bg-bowser-shell/20',
}

export function Card({ className, children, sticker, rotate = 6, ...props }: CardProps) {
    const shouldReduceMotion = useReducedMotion()
    const cardEl = (
        <div
            className={cn('relative rounded-2xl border border-wild-hillside/40 bg-white p-4', className)}
            {...props}
        >
            {children}
        </div>
    )

    if (!sticker) return cardEl

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
}