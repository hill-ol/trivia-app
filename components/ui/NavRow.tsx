'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type NavRowColor = 'blue' | 'lavender' | 'green'

interface NavRowProps {
    href: string
    icon: ReactNode
    label: string
    color?: NavRowColor
}

const ACCENTS: Record<NavRowColor, { iconBg: string; hoverBg: string; hoverBorder: string; hoverShadow: string }> = {
    blue: {
        iconBg: 'bg-marina/10 text-marina',
        hoverBg: 'hover:bg-marina/5',
        hoverBorder: 'hover:border-marina/40',
        hoverShadow: 'hover:shadow-marina/15',
    },
    lavender: {
        iconBg: 'bg-petal-plush/15 text-petal-plush-deep',
        hoverBg: 'hover:bg-petal-plush/5',
        hoverBorder: 'hover:border-petal-plush/50',
        hoverShadow: 'hover:shadow-petal-plush/15',
    },
    green: {
        iconBg: 'bg-bowser-shell/10 text-ink',
        hoverBg: 'hover:bg-bowser-shell/5',
        hoverBorder: 'hover:border-bowser-shell/40',
        hoverShadow: 'hover:shadow-bowser-shell/15',
    },
}

export function NavRow({ href, icon, label, color = 'blue' }: NavRowProps) {
    const [isHovered, setIsHovered] = useState(false)
    const accent = ACCENTS[color]

    return (
        <Link
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-2xl border border-wild-hillside/40 bg-white p-4 transition-all duration-200 active:scale-[0.98]',
                accent.hoverBg,
                accent.hoverBorder,
                'hover:shadow-md',
                accent.hoverShadow
            )}
        >
            <motion.div
                className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', accent.iconBg)}
                animate={isHovered ? { scale: 1.1, rotate: -6 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
                {icon}
            </motion.div>
            <span className="flex-1 text-[15px] font-medium text-ink">{label}</span>
            <motion.div
                animate={isHovered ? { x: 3 } : { x: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-wild-hillside"
            >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </motion.div>
        </Link>
    )
}