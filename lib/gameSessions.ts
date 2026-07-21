import { supabase } from '@/lib/supabase'
import { GameSession, Profile } from '@/types'
import {cacheKeys} from "@/lib/cacheKeys";
import {mutate} from "swr";

interface GameSessionRow {
    id: string
    profile_id: string
    score: number
    total_questions: number
    completed_at: string
}

function toGameSession(row: GameSessionRow): GameSession {
    return {
        id: row.id,
        profileId: row.profile_id,
        score: row.score,
        totalQuestions: row.total_questions,
        completedAt: row.completed_at,
    }
}

export async function recordSession(
    profileId: Profile['id'],
    score: number,
    totalQuestions: number
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('game_sessions').insert({
        profile_id: profileId,
        score,
        total_questions: totalQuestions,
    })
    if (error) {
        console.error('Failed to record session:', error.message)
        return { error: error.message }
    }
    void mutate((key) => Array.isArray(key) && key[0] === 'stats').catch((err) =>
        console.error('Failed to revalidate stats cache:', err)
    )
    void mutate(cacheKeys.leaderboard).catch((err) => console.error('Failed to revalidate leaderboard cache:', err))
    return { error: null }
}

export async function getSessionsForProfile(
    profileId: Profile['id']
): Promise<{ data: GameSession[]; error: string | null }> {
    const { data, error } = await supabase.from('game_sessions').select('*').eq('profile_id', profileId)
    if (error) {
        console.error('Failed to load sessions:', error.message)
        return { data: [], error: error.message }
    }
    return { data: (data as GameSessionRow[]).map(toGameSession), error: null }
}

export interface ProfileStats {
    gamesPlayed: number
    totalCorrect: number
    totalQuestions: number
    accuracy: number | null
}

export async function getStatsForProfile(
    profileId: Profile['id']
): Promise<{ data: ProfileStats; error: string | null }> {
    const { data: sessions, error } = await getSessionsForProfile(profileId)
    const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0)
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0)

    return {
        data: {
            gamesPlayed: sessions.length,
            totalCorrect,
            totalQuestions,
            accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
        },
        error,
    }
}