import { Question }  from '@/types'

export type PlayMode = 'new' | 'repeat'

export function filterQuestions(
    allQuestions: Question[],
    answerIds: Set<string>,
    categoryId: string | null,
    mode: PlayMode,
): Question[] {
    return allQuestions.filter((q) => {
        if (categoryId && q.category.id !== categoryId) return false
        return !(mode === 'new' && answerIds.has(q.id));

    })
}

export function getEmptyStateMessage(
    allQuestions: Question[],
    categoryId: string | null,
    mode: PlayMode,
): string {
    if (allQuestions.length === 0) return 'No questions yet! Ask your partner to add some.'
    const inCategory = categoryId ? allQuestions.filter((q) => q.category.id === categoryId) : allQuestions
    if (inCategory.length === 0) return 'No questions in this category yet'
    if (mode === 'new') return "You've answered all of these, try 'Play again'!"
    return 'No questions here yet'
}