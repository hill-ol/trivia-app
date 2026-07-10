'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

interface ProfileContextValue {
    currentProfile: Profile | null
    claimProfile: (name: string) => Promise<{ error: string | null }>
    clearProfile: () => Promise<void>
    isLoading: boolean
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            const { data: sessionData } = await supabase.auth.getSession()
            const userId = sessionData.session?.user.id

            if (!userId) {
                setIsLoading(false)
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (profile) {
                setCurrentProfile({ id: profile.id, name: profile.name, avatarUrl: profile.avatar_url })
            }
            setIsLoading(false)
        }

        loadProfile()
    }, [])

    const claimProfile = async (name: string) => {
        let userId = (await supabase.auth.getSession()).data.session?.user.id

        if (!userId) {
            const { data, error } = await supabase.auth.signInAnonymously()
            if (error || !data.user) return { error: error?.message ?? 'Could not sign in' }
            userId = data.user.id
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .insert({ id: userId, name })
            .select()
            .single()

        if (error) {
            const message =
                error.code === '23505' ? 'That name is already claimed on another device' : error.message
            return { error: message }
        }

        setCurrentProfile({ id: profile.id, name: profile.name, avatarUrl: profile.avatar_url })
        return { error: null }
    }

    const clearProfile = async () => {
        await supabase.auth.signOut()
        setCurrentProfile(null)
    }

    return (
        <ProfileContext.Provider value={{ currentProfile, claimProfile, clearProfile, isLoading }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    const context = useContext(ProfileContext)
    if (!context) throw new Error('useProfile must be used within a ProfileProvider')
    return context
}