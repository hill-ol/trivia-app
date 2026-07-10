import { supabase } from '@/lib/supabase'
import { GameSession, Profile } from '@/types'

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

    return { error: null }
}

export async function getSessionsForProfile(profileId: Profile['id']): Promise<GameSession[]> {
    const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('profile_id', profileId)

    if (error) {
        console.error('Failed to load sessions:', error.message)
        return []
    }

    return (data as GameSessionRow[]).map(toGameSession)
}

export interface ProfileStats {
    gamesPlayed: number
    totalCorrect: number
    totalQuestions: number
    accuracy: number | null
}

export async function getStatsForProfile(profileId: Profile['id']): Promise<ProfileStats> {
    const sessions = await getSessionsForProfile(profileId)
    const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0)
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0)

    return {
        gamesPlayed: sessions.length,
        totalCorrect,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
    }
}