'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { currentProfile, isLoading } = useProfile()
    const router = useRouter()
    
    useEffect(() => {
        if (!isLoading && !currentProfile) {
            router.replace('/')
        }
    }, [isLoading, currentProfile, router])

    if (isLoading || !currentProfile) {
        return null
    }

    return <>{children}</>
}