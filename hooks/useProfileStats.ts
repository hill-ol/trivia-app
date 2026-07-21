import useSWR from 'swr'
import { getStatsForProfile } from '@/lib/gameSessions'
import { cacheKeys } from '@/lib/cacheKeys'

export function useProfileStats(profileId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        profileId ? cacheKeys.stats(profileId) : null,
        () => getStatsForProfile(profileId!)
    )
    return { data: data?.data ?? null, error: data?.error ?? (error ? String(error) : null), isLoading, refetch: mutate }
}