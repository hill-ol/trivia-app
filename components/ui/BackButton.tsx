import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function BackButton() {
    return (
        <Link
            href="/home"
            aria-label="Back to home"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-wild-hillside/40 bg-white transition-transform active:scale-[0.95]"
        >
            <ChevronLeft className="h-4 w-4 text-ink" aria-hidden="true" />
        </Link>
    )
}