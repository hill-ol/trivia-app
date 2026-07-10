import { Question, Profile } from '@/types'
import { mockQuestions } from '@/lib/mockData'

const STORAGE_KEY = 'trivia-app-added-questions'

function getAddedQuestions(): Question[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
}

function getAllQuestions(): Question[] {
    return [...mockQuestions, ...getAddedQuestions()]
}

export function getQuestionsForProfile(profileId: Profile['id']): Question[] {
    return getAllQuestions().filter((q) => q.visibleToId === profileId)
}

export function addQuestion(question: Omit<Question, 'id'>): Question {
    const newQuestion: Question = { ...question, id: crypto.randomUUID() }
    const added = getAddedQuestions()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...added, newQuestion]))
    return newQuestion
}