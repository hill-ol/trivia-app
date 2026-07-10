import { supabase } from '@/lib/supabase'
import { Question, Profile } from '@/types'

interface QuestionRow {
    id: string
    author_id: string
    visible_to_id: string
    question_text: string
    choices: string[]
    correct_answer: string
    category: string
    difficulty: Question['difficulty']
}

function toQuestion(row: QuestionRow): Question {
    return {
        id: row.id,
        authorId: row.author_id,
        visibleToId: row.visible_to_id,
        questionText: row.question_text,
        choices: row.choices,
        correctAnswer: row.correct_answer,
        category: row.category,
        difficulty: row.difficulty,
    }
}

export async function getQuestionsForProfile(profileId: Profile['id']): Promise<Question[]> {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('visible_to_id', profileId)

    if (error) {
        console.error('Failed to load questions:', error.message)
        return []
    }

    return (data as QuestionRow[]).map(toQuestion)
}

export async function addQuestion(
    question: Omit<Question, 'id'>
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('questions').insert({
        author_id: question.authorId,
        visible_to_id: question.visibleToId,
        question_text: question.questionText,
        choices: question.choices,
        correct_answer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
    })

    if (error) {
        console.error('Failed to add question:', error.message)
        return { error: error.message }
    }

    return { error: null }
}