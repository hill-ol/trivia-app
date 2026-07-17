'use client'

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const VARIANTS = {
    default: {
        initial: { opacity: 0, y: 8},
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    },
    push: {
        initial: { opacity: 0, x: 48 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -24 },
    },
}

function getVariant(pathname: string) {
    if (pathname.startsWith("/categories") || pathname.includes('/edit')) return VARIANTS.push
    return VARIANTS.default
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const variant = getVariant(pathname)

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={variant.initial}
                animate={variant.animate}
                exit={variant.exit}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}