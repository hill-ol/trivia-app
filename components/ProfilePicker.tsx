'use client'

import { useRouter } from 'next/navigation'
import { mockProfiles } from '@/types/lib/mockData'
import { useProfile } from '@/contexts/ProfileContext'
import { Profile } from '@/types'

export function ProfilePicker() {
    const { setCurrentProfile } = useProfile()
    const router = useRouter()

    const handleSelect = (profile: Profile) => {
        setCurrentProfile(profile)
        router.push('/home')
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
            <h1 className="text-2xl font semibold">Who's playing?</h1>
            <div className="flex w-full max-w-sm flex-col gap-4">
                {mockProfiles.map((profile) => (
                    <button
                    key={profile.id}
                    onClick={() => handleSelect(profile)}
                    className="flex items-center gap-4 rounder-2xl border border-gray-200 bg-white p-4 text-left active:scale[0.98] transition-transoform"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-medium">
                            {profile.name.charAt(0)}
                        </div>
                        <span className="text-lg font-medium">{profile.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}