'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'

const WOBBLE_TRANSITION = { duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } as const

export function WobbleStar({ className = 'h-3.5 w-3.5 text-changeling' }: { className?: string }) {
    const shouldReduceMotion = useReducedMotion()
    return (
        <motion.div
            className="inline-flex"
            animate={shouldReduceMotion ? { rotate: -14 } : { rotate: [-20, -8, -20] }}
            transition={shouldReduceMotion ? { duration: 0 } : WOBBLE_TRANSITION}
        >
            <Star className={className} fill="currentColor" aria-hidden="true" />
        </motion.div>
    )
}