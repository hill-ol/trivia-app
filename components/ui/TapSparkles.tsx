'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface Sparkle {
    id: number
    x: number
    y: number
}

let nextId = 0

export function TapSparkles() {
    const [sparkles, setSparkles] = useState<Sparkle[]>([])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement
            if (!target.closest('button, a, .cursor-pointer')) return

            const id = nextId++
            setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
            setTimeout(() => {
                setSparkles((prev) => prev.filter((s) => s.id !== id))
            }, 700)
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    return (
        <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
            {sparkles.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute text-changeling"
                    style={{ left: s.x - 8, top: s.y - 8 }}
                    initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: 1, rotate: 25 }}
                    transition={{ duration: 0.7, times: [0, 0.25, 0.7, 1], ease: 'easeOut' }}
                >
                    <Star className="h-4 w-4" fill="currentColor" />
                </motion.div>
            ))}
        </div>
    )
}