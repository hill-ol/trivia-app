'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const WOBBLE_TRANSITION = { duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } as const

export function WobbleStar({ className = 'h-3.5 w-3.5 text-changeling' }: { className?: string }) {
    return (
        <motion.div className="inline-flex" animate={{ rotate: [-20, -8, -20] }} transition={WOBBLE_TRANSITION}>
            <Star className={className} fill="currentColor" aria-hidden="true" />
        </motion.div>
    )
}