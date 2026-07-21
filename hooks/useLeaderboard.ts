import useSWR from 'swr'
import { getAllProfiles } from '@/lib/profiles'
import { getStatsForProfile } from '@/lib/gameSessions'
import { cacheKeys } from '@/lib/cacheKeys'

async function loadLeaderboardRows() {
    const { data: profiles, error } = await getAllProfiles()
    if (error) return { data: [], error }
    const rows = await Promise.all(
        profiles.map(async (profile) => {
            const { data: stats } = await getStatsForProfile(profile.id)
            return { profile, stats }
        })
    )
    rows.sort((a, b) => b.stats.totalCorrect - a.stats.totalCorrect)
    return { data: rows, error: null }
}

export function useLeaderboard() {
    const { data, error, isLoading, mutate } = useSWR(cacheKeys.leaderboard, loadLeaderboardRows)
    return { data: data?.data ?? null, error: data?.error ?? (error ? String(error) : null), isLoading, refetch: mutate }
}