'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { cn } from '@/lib/utils'
import {WobbleStar} from "@/components/ui/WobbleStar";
import {Squiggle} from "@/components/ui/Squiggle";

const KNOWN_NAMES = ['Olivia', 'Hope']

const PROFILE_ACCENTS = [
    {
        rotate: '-rotate-[5deg]',
        stickerBg: 'bg-marina/30',
        avatarBg: 'bg-marina/10 text-marina',
        hoverBg: 'group-hover:bg-marina/20',
        hoverBorder: 'group-hover:border-marina/50',
        hoverShadow: 'group-hover:shadow-marina/25',
    },
    {
        rotate: 'rotate-[5deg]',
        stickerBg: 'bg-petal-plush/60',
        avatarBg: 'bg-petal-plush/15 text-petal-plush-deep',
        hoverBg: 'group-hover:bg-petal-plush/20',
        hoverBorder: 'group-hover:border-petal-plush/50',
        hoverShadow: 'group-hover:shadow-petal-plush/25',
    },
]

export function ProfilePicker() {
    const { claimProfile } = useProfile()
    const router = useRouter()
    const [pendingName, setPendingName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSelect = async (name: string) => {
        setPendingName(name)
        setError(null)
        const { error } = await claimProfile(name)
        if (error) {
            setError(error)
            setPendingName(null)
            return
        }
        router.push('/home')
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
            <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                    <WobbleStar />
                    <span className="text-xs text-ink-muted">Pick a profile</span>
                </div>
                <h1 className="font-display text-3xl text-ink">Who&apos;s playing?</h1>
                <Squiggle className="text-marina" />
            </div>

            <div className="flex w-full max-w-sm flex-col gap-10">
                {KNOWN_NAMES.map((name, i) => {
                    const accent = PROFILE_ACCENTS[i % PROFILE_ACCENTS.length]
                    return (
                        <div key={name} className="group relative">
                            <div
                                className={cn(
                                    'absolute inset-0 rounded-2xl transition-transform duration-300 group-hover:rotate-0',
                                    accent.stickerBg,
                                    accent.rotate
                                )}
                                aria-hidden="true"
                            />
                            <button
                                onClick={() => handleSelect(name)}
                                disabled={pendingName !== null}
                                className={cn(
                                    'relative flex min-h-[44px] w-full items-center gap-4 rounded-2xl border border-wild-hillside/40 bg-white p-4 text-left transition-colors transition-transform duration-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                                    'group-hover:shadow-lg',
                                    accent.hoverBg,
                                    accent.hoverBorder,
                                    accent.hoverShadow
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-medium',
                                        accent.avatarBg
                                    )}
                                >
                                    {name.charAt(0)}
                                </div>
                                <span className="text-lg font-medium text-ink">
                  {pendingName === name ? 'Setting up...' : name}
                </span>
                            </button>
                        </div>
                    )
                })}
            </div>

            {error && <p className="text-sm text-briar-rose">{error}</p>}
        </div>
    )
}