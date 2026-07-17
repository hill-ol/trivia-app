import { supabase } from '@/lib/supabase'
import { Question, Profile } from '@/types'
import {getAnsweredQuestionIds} from "@/lib/questionAttempts";

interface QuestionRow {
    id: string
    author_id: string
    visible_to_id: string
    question_text: string
    choices: string[]
    correct_answer: string
    difficulty: Question['difficulty']
    category: { id: string; name: string; color: Question['category']['color'] } | null
}

function toQuestion(row: QuestionRow): Question {
    return {
        id: row.id,
        authorId: row.author_id,
        visibleToId: row.visible_to_id,
        questionText: row.question_text,
        choices: row.choices,
        correctAnswer: row.correct_answer,
        difficulty: row.difficulty,
        category: row.category as Question['category'],
    }
}

export async function getQuestionsForProfile(
    profileId: Profile['id']
): Promise<{ data: Question[]; error: string | null }> {
    const { data, error } = await supabase
        .from('questions')
        .select('*, category:categories(id, name, color)')
        .eq('visible_to_id', profileId)

    if (error) {
        console.error('Failed to load questions:', error.message)
        return { data: [], error: error.message }
    }
    return { data: (data as QuestionRow[]).map(toQuestion), error: null }
}

export async function getQuestionsByAuthor(
    profileId: Profile['id']
): Promise<{ data: Question[]; error: string | null }> {
    const { data, error } = await supabase
        .from('questions')
        .select('*, category:categories(id, name, color)')
        .eq('author_id', profileId)

    if (error) {
        console.error('Failed to load your questions:', error.message)
        return { data: [], error: error.message }
    }
    return { data: (data as QuestionRow[]).map(toQuestion), error: null }
}

export async function getQuestionById(
    id: string
): Promise<{ data: Question | null; error: string | null }> {
    const { data, error } = await supabase
        .from('questions')
        .select('*, category:categories(id, name, color)')
        .eq('id', id)
        .maybeSingle()

    if (error) {
        console.error('Failed to load question:', error.message)
        return { data: null, error: error.message }
    }
    return { data: data ? toQuestion(data as QuestionRow) : null, error: null }
}

export async function addQuestion(
    question: Omit<Question, 'id' | 'category'> & { categoryId: string }
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('questions').insert({
        author_id: question.authorId,
        visible_to_id: question.visibleToId,
        question_text: question.questionText,
        choices: question.choices,
        correct_answer: question.correctAnswer,
        category_id: question.categoryId,
        difficulty: question.difficulty,
    })
    if (error) {
        console.error('Failed to add question:', error.message)
        return { error: error.message }
    }
    return { error: null }
}

export async function updateQuestion(
    id: string,
    question: Omit<Question, 'id' | 'authorId' | 'visibleToId' | 'category'> & { categoryId: string }
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('questions')
        .update({
            question_text: question.questionText,
            choices: question.choices,
            correct_answer: question.correctAnswer,
            category_id: question.categoryId,
            difficulty: question.difficulty,
        })
        .eq('id', id)
    if (error) {
        console.error('Failed to update question:', error.message)
        return { error: error.message }
    }
    return { error: null }
}

export async function deleteQuestion(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) {
        console.error('Failed to delete question:', error.message)
        return { error: error.message }
    }
    return { error: null }
}

export async function getPlayData(
    profileId: Profile['id']
): Promise<{ data: { questions: Question[]; answeredIds: Set<string> }; error: string | null }> {
    const [questionsResult, answeredResult] = await Promise.all([
        getQuestionsForProfile(profileId),
        getAnsweredQuestionIds(profileId),
    ])

    return {
        data: { questions: questionsResult.data, answeredIds: answeredResult.data },
        error: questionsResult.error ?? answeredResult.error,
    }
}