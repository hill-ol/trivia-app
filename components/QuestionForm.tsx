'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {ChevronRight, Plus, X} from 'lucide-react'
import { getAllCategories, createCategory } from '@/lib/categories'
import { pointsChipColor, POINT_VALUES, PointValue } from '@/lib/points'
import { CHOICE_TINTS } from '@/lib/choiceTints'
import { getMissingFieldMessage } from '@/lib/questionValidation'
import { playCorrectChime } from '@/lib/sound'
import { Card } from '@/components/ui/Card'
import { ChipButton } from '@/components/ui/Chip'
import { Tooltip } from '@/components/ui/Tooltip'
import { Category, Question } from '@/types'
import { cn } from '@/lib/utils'
import Link from "next/link";

const MIN_CHOICES = 2
const MAX_CHOICES = 4

interface ChoiceItem {
    id: string
    text: string
}

function makeChoice(text = ''): ChoiceItem {
    return { id: crypto.randomUUID(), text }
}

export interface QuestionFormData {
    questionText: string
    choices: string[]
    correctAnswer: string
    categoryId: string
    points: PointValue
}

interface QuestionFormProps {
    initialQuestion?: Question
    submitLabel: string
    submitLabelSuccess: string
    onSubmit: (data: QuestionFormData) => Promise<{ error: string | null }>
    onSuccess?: () => void
}

export function QuestionForm({ initialQuestion, submitLabel, submitLabelSuccess, onSubmit, onSuccess }: QuestionFormProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialQuestion?.category.id ?? null)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [categoryError, setCategoryError] = useState<string | null>(null)
    const [showEmptyCategoryTooltip, setShowEmptyCategoryTooltip] = useState(false)
    const [questionText, setQuestionText] = useState(initialQuestion?.questionText ?? '')
    const [choices, setChoices] = useState<ChoiceItem[]>(() =>
        initialQuestion
            ? initialQuestion.choices.map((text) => makeChoice(text))
            : [makeChoice(), makeChoice(), makeChoice(), makeChoice()]
    )
    const [correctId, setCorrectId] = useState<string | null>(() => {
        if (!initialQuestion) return null
        return choices.find((c) => c.text === initialQuestion.correctAnswer)?.id ?? null
    })
    const [points, setPoints] = useState<PointValue>(initialQuestion?.points ?? 100)
    const [justSubmitted, setJustSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [showMissingFieldTooltip, setShowMissingFieldTooltip] = useState(false)

    useEffect(() => {
        getAllCategories().then(({ data }) => setCategories(data))
    }, [])

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setShowEmptyCategoryTooltip(true)
            setTimeout(() => setShowEmptyCategoryTooltip(false), 2000)
            return
        }
        const { category, error } = await createCategory(newCategoryName)
        if (error) {
            setCategoryError(error)
            return
        }
        if (category) {
            setCategories((prev) => [...prev, category])
            setSelectedCategoryId(category.id)
            setNewCategoryName('')
            setCategoryError(null)
        }
    }

    const updateChoice = (id: string, value: string) => {
        setChoices((prev) => prev.map((c) => (c.id === id ? { ...c, text: value } : c)))
    }

    const addChoice = () => {
        setChoices((prev) => (prev.length < MAX_CHOICES ? [...prev, makeChoice()] : prev))
    }

    const removeChoice = (id: string) => {
        if (choices.length <= MIN_CHOICES) return
        setChoices((prev) => prev.filter((c) => c.id !== id))
        setCorrectId((prev) => (prev === id ? null : prev))
    }

    const isValid =
        questionText.trim().length > 0 &&
        choices.every((c) => c.text.trim().length > 0) &&
        correctId !== null &&
        selectedCategoryId !== null

    const handleSubmit = async () => {
        if (!isValid || !correctId || !selectedCategoryId) {
            setShowMissingFieldTooltip(true)
            setTimeout(() => setShowMissingFieldTooltip(false), 2000)
            return
        }

        const correctChoice = choices.find((c) => c.id === correctId)
        if (!correctChoice) return

        setSubmitError(null)

        const { error } = await onSubmit({
            questionText: questionText.trim(),
            choices: choices.map((c) => c.text.trim()),
            correctAnswer: correctChoice.text.trim(),
            categoryId: selectedCategoryId,
            points,
        })

        if (error) {
            setSubmitError(error)
            return
        }

        playCorrectChime()
        setJustSubmitted(true)
        setTimeout(() => setJustSubmitted(false), 1200)
        onSuccess?.()

        if (!initialQuestion) {
            setQuestionText('')
            setChoices([makeChoice(), makeChoice(), makeChoice(), makeChoice()])
            setCorrectId(null)
            setSelectedCategoryId(null)
            setPoints(100)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <label className="text-xs text-ink-muted">Question</label>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="mt-1 w-full resize-none border-none p-0 text-lg text-ink outline-none placeholder:text-wild-hillside"
                    rows={2}
                    placeholder="Where did we go on our first date?"
                />
            </Card>

            <div className="flex flex-col gap-3">
                <p className="text-xs text-ink-muted">Choices, tap the correct one</p>
                <AnimatePresence initial={false} mode="popLayout">
                    {choices.map((choice, index) => {
                        const isCorrect = correctId === choice.id
                        return (
                            <motion.div
                                key={choice.id}
                                layout
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ layout: { duration: 0.25, ease: 'easeOut' }, opacity: { duration: 0.2 }, x: { duration: 0.2 } }}
                            >
                                <Card
                                    className={cn(
                                        'flex items-center gap-3',
                                        isCorrect ? 'border-bowser-shell bg-bowser-shell/10' : CHOICE_TINTS[index % CHOICE_TINTS.length]
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setCorrectId(choice.id)}
                                        aria-label={`Mark choice ${index + 1} as correct`}
                                        className={cn(
                                            'h-5 w-5 shrink-0 cursor-pointer rounded-full border transition-colors',
                                            isCorrect ? 'border-bowser-shell bg-bowser-shell' : 'border-wild-hillside/60 bg-white'
                                        )}
                                    />
                                    <input
                                        value={choice.text}
                                        onChange={(e) => updateChoice(choice.id, e.target.value)}
                                        placeholder={`Choice ${index + 1}`}
                                        className="w-full border-none bg-transparent p-0 text-ink outline-none placeholder:text-wild-hillside"
                                    />
                                    {choices.length > MIN_CHOICES && (
                                        <button
                                            type="button"
                                            onClick={() => removeChoice(choice.id)}
                                            aria-label={`Remove choice ${index + 1}`}
                                            className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                <AnimatePresence>
                    {choices.length < MAX_CHOICES && (
                        <motion.button
                            type="button"
                            onClick={addChoice}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-marina"
                        >
                            <Plus className="h-4 w-4" />
                            Add choice
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs text-ink-muted">Category</label>
                    <Link href="/categories" className="flex items-center gap-0.5 text-xs font-medium text-marina">
                        Manage
                        <ChevronRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <ChipButton
                            key={cat.id}
                            color={cat.color}
                            selected={selectedCategoryId === cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                        >
                            {cat.name}
                        </ChipButton>
                    ))}
                </div>
                <div className="flex items-center gap-2 border-t border-wild-hillside/30 pt-3">
                    <div className="relative flex-1">
                        <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category"
                            className="w-full border-none bg-transparent p-0 text-sm text-ink outline-none placeholder:text-wild-hillside"
                        />
                        <Tooltip show={showEmptyCategoryTooltip} message="Give it a name first!" className="bottom-full left-0 mb-2" />
                    </div>
                    <button type="button" onClick={handleCreateCategory} aria-label="Add category" className="cursor-pointer text-marina">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                {categoryError && <p className="text-xs text-briar-rose">{categoryError}</p>}
            </Card>

            <Card className="flex flex-col gap-3">
                <label className="text-xs text-ink-muted">Points</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {POINT_VALUES.map((value) => (
                        <ChipButton key={value} color={pointsChipColor(value)} selected={points === value} onClick={() => setPoints(value)}>
                            {value}
                        </ChipButton>
                    ))}
                </div>
            </Card>

            {submitError && <p className="text-sm text-briar-rose">{submitError}</p>}

            <div className="relative">
                <button
                    onClick={handleSubmit}
                    className={cn(
                        'w-full cursor-pointer rounded-2xl p-4 text-lg font-medium transition-all active:scale-[0.98]',
                        !isValid && 'bg-wild-hillside/40 text-ink-muted',
                        isValid && !justSubmitted && 'bg-marina text-white',
                        justSubmitted && 'animate-pop bg-bowser-shell text-white'
                    )}
                >
                    {justSubmitted ? submitLabelSuccess : submitLabel}
                </button>
                <Tooltip
                    show={showMissingFieldTooltip}
                    message={getMissingFieldMessage(questionText, choices, correctId, selectedCategoryId)}
                    className="bottom-full left-1/2 mb-2 -translate-x-1/2"
                />
            </div>
        </div>
    )
}