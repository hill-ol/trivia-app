import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlaySession } from './usePlaySession'
import { Question } from "@/types";

const mockQuestions: Question[] = [
    {
        id: 'q1',
        authorId: 'a1',
        visibleToId: 'a2',
        questionText: 'Question 1',
        choices: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        category: { id: 'c1', name: 'Test', color: 'blue' },
    },
    {
        id: 'q2',
        authorId: 'a1',
        visibleToId: 'a2',
        questionText: 'Question 2',
        choices: ['C', 'D'],
        correctAnswer: 'D',
        difficulty: 'easy',
        category: { id: 'c1', name: 'Test', color: 'blue' },
    },
]

describe('usePlaySession', () => {
    it('starts in the answering state on the first question', () => {
        const { result } = renderHook(() => usePlaySession(mockQuestions))
        expect(result.current.state).toEqual({ status: 'answering', questionIndex: 0 })
        expect(result.current.score).toBe(0)
    })

    it('starts finished immediately if given no questions', () => {
        const { result } = renderHook(() => usePlaySession([]))
        expect(result.current.state).toEqual({ status: 'finished' })
    })

    it('marks a correct answer and increments score', () => {
        const { result } = renderHook(() => usePlaySession(mockQuestions))
        act(() => result.current.submitAnswer('A'))
        expect(result.current.state).toEqual({
            status: 'answered',
            questionIndex: 0,
            selectedAnswer: 'A',
            isCorrect: true,
        })
        expect(result.current.score).toBe(1)
    })

    it('marks a wrong answer without incrementing score', () => {
        const { result } = renderHook(() => usePlaySession(mockQuestions))
        act(() => result.current.submitAnswer('B'))
        expect(result.current.score).toBe(0)
    })

    it('ignores a second submitAnswer call while already answered', () => {
        const { result } = renderHook(() => usePlaySession(mockQuestions))
        act(() => result.current.submitAnswer('A'))
        act(() => result.current.submitAnswer('B'))
        expect(result.current.score).toBe(1)
        expect(result.current.state).toMatchObject({ selectedAnswer: 'A' })
    })

    it('advances to the next question and finishes after the last one', () => {
        const { result } = renderHook(() => usePlaySession(mockQuestions))
        act(() => result.current.submitAnswer('A'))
        act(() => result.current.nextQuestion())
        expect(result.current.state).toEqual({ status: 'answering', questionIndex: 1 })

        act(() => result.current.submitAnswer('D'))
        act(() => result.current.nextQuestion())
        expect(result.current.state).toEqual({ status: 'finished' })
        expect(result.current.score).toBe(2)
    })

    it('calls onAnswer once per submission, with the right question and correctness', () => {
        const onAnswer = vi.fn()
        const { result } = renderHook(() => usePlaySession(mockQuestions, onAnswer))
        act(() => result.current.submitAnswer('A'))
        expect(onAnswer).toHaveBeenCalledTimes(1)
        expect(onAnswer).toHaveBeenCalledWith(mockQuestions[0], true)
    })
})