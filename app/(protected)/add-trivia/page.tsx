'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { getOtherProfile } from '@/lib/profiles'
import { addQuestion } from '@/lib/questions'
import { QuestionForm, QuestionFormData } from '@/components/QuestionForm'
import { BackButton } from '@/components/ui/BackButton'
import { Profile } from '@/types'

export default function AddTriviaPage() {
    const { currentProfile } = useProfile()
    const [otherProfile, setOtherProfile] = useState<Profile | undefined>(undefined)

    useEffect(() => {
        if (!currentProfile) return
        getOtherProfile(currentProfile.id).then(({ data }) => setOtherProfile(data))
    }, [currentProfile])

    const handleSubmit = async (data: QuestionFormData) => {
        if (!currentProfile || !otherProfile) {
            return { error: 'Waiting for your partner to join first' }
        }
        return addQuestion({
            authorId: currentProfile.id,
            visibleToId: otherProfile.id,
            questionText: data.questionText,
            choices: data.choices,
            correctAnswer: data.correctAnswer,
            categoryId: data.categoryId,
            difficulty: data.difficulty,
        })
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <div>
                    <h1 className="font-display text-2xl text-ink">Add trivia</h1>
                    <p className="text-sm text-ink-muted">
                        Only <span className="font-medium text-ink">{otherProfile?.name ?? 'the other person'}</span> will see this question.
                    </p>
                </div>
            </div>

            <QuestionForm onSubmit={handleSubmit} submitLabel="Add question" submitLabelSuccess="Added!" />

            <Link href="/my-questions" className="flex items-center justify-center gap-0.5 text-sm font-medium text-marina">
                View your questions
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
        </div>
    )
}