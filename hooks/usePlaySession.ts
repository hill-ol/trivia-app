'use client'

import { useState } from "react";
import { Question } from '@/types'

type PlayState =
    | { status: 'answering'; questionIndex: number }
    | { status: 'answered'; questionIndex: number; selectedAnswer: string; isCorrect: boolean }
    | { status: 'finished' }

interface UsePlaySessionResult {
    state: PlayState
    currentQuestion: Question | undefined
    score: number
    submitAnswer: (answer: string) => void
    nextQuestion: () => void
}

export function usePlaySession(questions: Question[]): UsePlaySessionResult {
    const [state, setState] = useState<PlayState>(
        questions.length > 0 ? { status: 'answering', questionIndex: 0 } : { status: 'finished' }
    )
    const [score, setScore] = useState(0)

    const currentQuestion =
        state.status !== 'finished' ? questions[state.questionIndex] : undefined

    const submitAnswer = (answer: string) => {
        if (state.status !== 'answering' || !currentQuestion) return
        const isCorrect = answer === currentQuestion.correctAnswer
        if (isCorrect) setScore((s) => s + 1)
        setState({ status: 'answered', questionIndex: state.questionIndex, selectedAnswer: answer, isCorrect })
    }

    const nextQuestion = () => {
        if (state.status !== 'answered') return
        const nextIndex = state.questionIndex + 1
        setState(
            nextIndex < questions.length
                ? { status: 'answering', questionIndex: nextIndex }
                : { status: 'finished' }
        )
    }

    return { state, currentQuestion, score, submitAnswer, nextQuestion }
}