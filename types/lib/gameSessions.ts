import { GameSession, Profile } from '@/types'

const STORAGE_KEY = 'trivia-app-game-sessions'

function getAllSessions(): GameSession[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
}

export function recordSession(
    profileId: Profile['id'],
    score: number,
    totalQuestions: number
): GameSession {
    const session: GameSession = {
        id: crypto.randomUUID(),
        profileId,
        score,
        totalQuestions,
        completedAt: new Date().toISOString(),
    }
    const sessions = getAllSessions()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...sessions, session]))
    return session
}

export function getSessionsForProfile(profileId: Profile['id']): GameSession[] {
    return getAllSessions().filter((s) => s.profileId === profileId)
}

export function getTotalScoreForProfile(profileId: Profile['id']): number {
    return getSessionsForProfile(profileId).reduce((sum, s) => sum + s.score, 0)
}

export interface ProfileStats {
    gamesPlayed: number
    totalCorrect: number
    totalQuestions: number
    accuracy: number | null
}

export function getStatsForProfile(profileId: Profile['id']): ProfileStats {
    const sessions = getSessionsForProfile(profileId)
    const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0)
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0)

    return {
        gamesPlayed: sessions.length,
        totalCorrect,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
    }
}