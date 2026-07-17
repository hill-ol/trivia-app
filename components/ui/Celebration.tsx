'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const PARTICLES = [
    { x: -60, y: -40, color: 'text-changeling', rotate: -20 },
    { x: 60, y: -40, color: 'text-petal-plush', rotate: 15 },
    { x: -80, y: 10, color: 'text-marina', rotate: 10 },
    { x: 80, y: 10, color: 'text-ink', rotate: -15 },
    { x: -40, y: 50, color: 'text-petal-plush', rotate: 25 },
    { x: 40, y: 50, color: 'text-changeling', rotate: -10 },
]

export function Celebration() {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {PARTICLES.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${p.color}`}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.rotate }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.04, ease: 'easeOut' }}
                >
                    <Star className="h-4 w-4" fill="currentColor" />
                </motion.div>
            ))}
        </div>
    )
}