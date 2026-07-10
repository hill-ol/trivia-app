'use client'

import { Profile } from '@/types'
import {createContext, useContext, useState} from "react";

interface ProfileContextValue {
    currentProfile: Profile | null
    setCurrentProfile: (profile: Profile) => void
    clearProfile: () => void
    isLoading: boolean
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)
const STORAGE_KEY = 'trivia-app-profile-id'

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
        const storeId = localStorage.getItem(STORAGE_KEY)
        const found = mockProfiles.find((p) => p.id === storeId)
        if (found) setCurrentProfileState(found)
        setIsLoading(false)
    }, [])
    
    const setCurrentProfile = (profile: Profile) => {
        localStorage.setItem(STORAGE_KEY, profile.id)
        setCurrentProfileState(profile)
    }
    
    const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentProfileState(null)
    }
    
    return (
        <ProfileContext.Provider value={{ currentProfile, setCurrentProfile, clearProfile, isLoading }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    const context = useContext(ProfileContext)
    if (!context) throw new Error('useProfile must be used within a ProfileProvider')
    return context
}