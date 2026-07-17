export interface Profile {
    id: string
    name: string
    avatarUrl?: string
}

export interface Question {
    id: string
    authorId: Profile['id']
    visibleToId: Profile['id']
    questionText: string
    choices: string[]
    correctAnswer: string
    category: Category
    points: 100 | 200 | 300 | 400 | 500
}

export interface GameSession {
    id: string
    profileId: Profile['id']
    score: number
    totalQuestions: number
    completedAt: string
}

export interface Category {
    id: string
    name: string
    color: 'blue' | 'lavender' | 'green' | 'rose'
}