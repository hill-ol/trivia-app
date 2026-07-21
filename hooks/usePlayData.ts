import useSWR from 'swr'
import { getPlayData } from '@/lib/questions'
import { cacheKeys } from '@/lib/cacheKeys'

export function usePlayData(profileId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        profileId ? cacheKeys.playData(profileId) : null,
        () => getPlayData(profileId!)
    )
    return { data: data?.data ?? null, error: data?.error ?? (error ? String(error) : null), isLoading, refetch: mutate }
}