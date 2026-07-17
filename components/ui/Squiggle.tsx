'use client'

import { motion } from 'framer-motion'

interface SquiggleProps {
    className?: string
    width?: number
}

export function Squiggle({ className = 'text-marina', width = 110 }: SquiggleProps) {
    return (
        <svg width={width} height="10" viewBox="0 0 110 10" preserveAspectRatio="none" className={className} aria-hidden="true">
            <motion.path
                d="M2,6 Q17,0 32,6 T62,6 T92,6 T110,6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
        </svg>
    )
}