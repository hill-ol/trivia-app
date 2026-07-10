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
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameSession {
    id: string
    profileId: Profile['id']
    score: number
    totalQuestions: number
    completedAt: string
}