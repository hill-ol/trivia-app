'use client'

import { useParams, useRouter } from 'next/navigation'
import { getQuestionById, updateQuestion } from '@/lib/questions'
import { useAsyncData } from '@/hooks/useAsyncData'
import { QuestionForm, QuestionFormData } from '@/components/QuestionForm'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'

export default function EditQuestionPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { data: question, error, isLoading, refetch } = useAsyncData(() => getQuestionById(params.id), [params.id])

    const handleSubmit = async (data: QuestionFormData) => updateQuestion(params.id, data)

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <h1 className="font-display text-2xl text-ink">Edit question</h1>
            </div>

            {error ? (
                <ErrorNotice message="Couldn't load this question." onRetry={refetch} />
            ) : isLoading ? (
                <p className="text-sm text-ink-muted">Loading...</p>
            ) : !question ? (
                <p className="text-sm text-ink-muted">Couldn&apos;t find that question.</p>
            ) : (
                <QuestionForm
                    initialQuestion={question}
                    onSubmit={handleSubmit}
                    submitLabel="Save changes"
                    submitLabelSuccess="Saved!"
                    onSuccess={() => router.push('/my-questions')}
                />
            )}
        </div>
    )
}