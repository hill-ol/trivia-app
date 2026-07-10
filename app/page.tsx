'use client'

import { useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { ProfilePicker } from '@/components/ProfilePicker'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const { currentProfile, isLoading } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && currentProfile) {
      router.replace('/home')
    }
  }, [isLoading, currentProfile, router])

  if (isLoading || currentProfile) {
    //without returning null, a returning user would see the picker screen flash on screen
    return null
  }

  return <ProfilePicker />
}