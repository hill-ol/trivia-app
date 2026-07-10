'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'

const KNOWN_NAMES = ['You', 'Her'] // replace with your actual names

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
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
            <h1 className="text-2xl font-semibold">Who&apos;s playing?</h1>
            <div className="flex w-full max-w-sm flex-col gap-4">
                {KNOWN_NAMES.map((name) => (
                    <button
                        key={name}
                        onClick={() => handleSelect(name)}
                        disabled={pendingName !== null}
                        className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-medium">
                            {name.charAt(0)}
                        </div>
                        <span className="text-lg font-medium">
              {pendingName === name ? 'Setting up...' : name}
            </span>
                    </button>
                ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}