'use client'

import { useState } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { mockProfiles } from '@/lib/mockData'
import { addQuestion } from '@/lib/questions'
import { Card } from '@/components/ui/Card'
import { Question } from '@/types'

function getOtherProfile(currentId: string) {
    return mockProfiles.find((p) => p.id !== currentId)
}

const EMPTY_CHOICES = ['', '', '', '']

export default function AddTriviaPage() {
    const { currentProfile } = useProfile()
    const [questionText, setQuestionText] = useState('')
    const [choices, setChoices] = useState<string[]>(EMPTY_CHOICES)
    const [correctIndex, setCorrectIndex] = useState<number | null>(null)
    const [category, setCategory] = useState('')
    const [difficulty, setDifficulty] = useState<Question['difficulty']>('easy')
    const [justAdded, setJustAdded] = useState(false)

    const otherProfile = currentProfile ? getOtherProfile(currentProfile.id) : undefined

    const updateChoice = (index: number, value: string) => {
        setChoices((prev) => prev.map((c, i) => (i === index ? value : c)))
    }

    const isValid =
        questionText.trim().length > 0 &&
        choices.every((c) => c.trim().length > 0) &&
        correctIndex !== null &&
        category.trim().length > 0

    const handleSubmit = () => {
        if (!isValid || !currentProfile || !otherProfile || correctIndex === null) return

        addQuestion({
            authorId: currentProfile.id,
            visibleToId: otherProfile.id,
            questionText: questionText.trim(),
            choices: choices.map((c) => c.trim()),
            correctAnswer: choices[correctIndex].trim(),
            category: category.trim(),
            difficulty,
        })

        setQuestionText('')
        setChoices(EMPTY_CHOICES)
        setCorrectIndex(null)
        setCategory('')
        setDifficulty('easy')
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-6 py-10">
            <div>
                <h1 className="text-2xl font-semibold">Add trivia</h1>
                <p className="text-sm text-gray-500">
                    Only {otherProfile?.name} will see this question.
                </p>
            </div>

            <Card>
                <label className="text-sm text-gray-500">Question</label>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="mt-1 w-full resize-none border-none p-0 text-lg outline-none"
                    rows={2}
                    placeholder="Where did we go on our first date?"
                />
            </Card>

            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">Choices, tap the correct one</p>
                {choices.map((choice, index) => (
                    <Card
                        key={index}
                        className={
                            correctIndex === index
                                ? 'flex items-center gap-3 border-green-500 bg-green-50'
                                : 'flex items-center gap-3'
                        }
                    >
                        <button
                            type="button"
                            onClick={() => setCorrectIndex(index)}
                            className={
                                correctIndex === index
                                    ? 'h-5 w-5 shrink-0 rounded-full bg-green-500'
                                    : 'h-5 w-5 shrink-0 rounded-full border border-gray-300'
                            }
                            aria-label={`Mark choice ${index + 1} as correct`}
                        />
                        <input
                            value={choice}
                            onChange={(e) => updateChoice(index, e.target.value)}
                            placeholder={`Choice ${index + 1}`}
                            className="w-full border-none p-0 outline-none"
                        />
                    </Card>
                ))}
            </div>

            <Card className="flex items-center justify-between">
                <label className="text-sm text-gray-500">Category</label>
                <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="first date"
                    className="w-1/2 border-none p-0 text-right outline-none"
                />
            </Card>

            <Card className="flex items-center justify-between">
                <label className="text-sm text-gray-500">Difficulty</label>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Question['difficulty'])}
                    className="border-none bg-transparent p-0 text-right outline-none"
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </Card>

            <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="rounded-2xl bg-gray-900 p-4 text-lg font-medium text-white disabled:bg-gray-300"
            >
                {justAdded ? 'Added!' : 'Add question'}
            </button>
        </div>
    )
}