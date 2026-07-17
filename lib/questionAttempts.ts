import { supabase } from '@/lib/supabase'
import {Category, Profile, Question} from '@/types'

interface AttemptRow {
    id: string
    is_correct: boolean
    answered_at: string
    question: {
        question_text: string
        category: { id: string; name: string; color: Category['color'] }
    } | null
}

export async function recordAttempt(
    profileId: Profile['id'],
    questionId: Question['id'],
    isCorrect: boolean
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('question_attempts').insert({
        profile_id: profileId,
        question_id: questionId,
        is_correct: isCorrect,
    })
    if (error) {
        console.error('Failed to record attempt:', error.message)
        return { error: error.message }
    }
    return { error: null }
}

export async function getAnsweredQuestionIds(
    profileId: Profile['id']
): Promise<{ data: Set<string>; error: string | null }> {
    const { data, error } = await supabase.from('question_attempts').select('question_id').eq('profile_id', profileId)
    if (error) {
        console.error('Failed to load attempt history:', error.message)
        return { data: new Set(), error: error.message }
    }
    return { data: new Set(data.map((row) => row.question_id as string)), error: null }
}

export interface AttemptHistoryItem {
    id: string
    questionText: string
    category: Category
    isCorrect: boolean
    answeredAt: string
}

export async function getAttemptHistory(
    profileId: Profile['id']
): Promise<{ data: AttemptHistoryItem[]; error: string | null }> {
    const { data, error } = await supabase
        .from('question_attempts')
        .select('id, is_correct, answered_at, question:questions(question_text, category:categories(id, name, color))')
        .eq('profile_id', profileId)
        .order('answered_at', { ascending: false })

    if (error) {
        console.error('Failed to load attempt history:', error.message)
        return { data: [], error: error.message }
    }

    const items = (data as unknown as AttemptRow[])
        .filter((row) => row.question !== null)
        .map((row) => ({
            id: row.id,
            questionText: row.question!.question_text,
            category: row.question!.category,
            isCorrect: row.is_correct,
            answeredAt: row.answered_at,
        }))

    return { data: items, error: null }
}