import { describe, it, expect } from 'vitest'
import { filterQuestions, getEmptyStateMessage } from './playFilters'
import { Question } from '@/types'

function makeQuestion(overrides: Partial<Question>): Question {
    return {
        id: 'q1',
        authorId: 'a1',
        visibleToId: 'a2',
        questionText: 'Q',
        choices: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        category: { id: 'cat-1', name: 'First date', color: 'blue' },
        ...overrides,
    }
}

describe('filterQuestions', () => {
    const questions = [
        makeQuestion({ id: 'q1', category: { id: 'cat-1', name: 'First date', color: 'blue' } }),
        makeQuestion({ id: 'q2', category: { id: 'cat-2', name: 'Random facts', color: 'green' } }),
    ]

    it('returns everything when no category is selected and mode is repeat', () => {
        expect(filterQuestions(questions, new Set(), null, 'repeat')).toHaveLength(2)
    })

    it('filters down to just the selected category', () => {
        const result = filterQuestions(questions, new Set(), 'cat-1', 'repeat')
        expect(result.map((q) => q.id)).toEqual(['q1'])
    })

    it('excludes already-answered questions in new mode', () => {
        const result = filterQuestions(questions, new Set(['q1']), null, 'new')
        expect(result.map((q) => q.id)).toEqual(['q2'])
    })

    it('includes already-answered questions in repeat mode', () => {
        expect(filterQuestions(questions, new Set(['q1']), null, 'repeat')).toHaveLength(2)
    })
})

describe('getEmptyStateMessage', () => {
    it('says there are no questions at all when the list is empty', () => {
        expect(getEmptyStateMessage([], null, 'new')).toBe('No questions yet! Ask your partner to add some.')
    })

    it('says the category is empty when nothing matches it', () => {
        const questions = [makeQuestion({ category: { id: 'cat-1', name: 'First date', color: 'blue' } })]
        expect(getEmptyStateMessage(questions, 'cat-2', 'new')).toBe('No questions in this category yet')
    })

    it("nudges toward 'Play again' once everything new has been answered", () => {
        const questions = [makeQuestion({})]
        expect(getEmptyStateMessage(questions, null, 'new')).toBe("You've answered all of these, try 'Play again'!")
    })
})