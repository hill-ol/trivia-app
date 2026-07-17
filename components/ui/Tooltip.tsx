'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type TooltipVariant = 'error' | 'info'

interface TooltipProps {
    show: boolean
    message: string
    variant?: TooltipVariant
    className?: string
}

const VARIANT_STYLES: Record<TooltipVariant, string> = {
    error: 'border-briar-rose/40 bg-briar-rose/10 text-briar-rose',
    info: 'border-marina/40 bg-marina/10 text-marina-deep',
}

export function Tooltip({ show, message, variant = 'error', className }: TooltipProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={cn(
                        'absolute z-10 flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-medium shadow-md',
                        VARIANT_STYLES[variant],
                        className
                    )}
                >
                    <Star className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true" />
                    {message}
                    <span
                        className={cn(
                            'absolute left-4 h-2 w-2 rotate-45 border-b border-r',
                            variant === 'error' ? 'border-briar-rose/40 bg-briar-rose/10' : 'border-marina/40 bg-marina/10',
                            className?.includes('bottom-full') ? '-bottom-1' : '-top-1'
                        )}
                        aria-hidden="true"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}