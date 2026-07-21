import useSWR from 'swr'
import { getQuestionsByAuthor } from '@/lib/questions'
import { cacheKeys } from '@/lib/cacheKeys'

export function useMyQuestions(profileId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        profileId ? cacheKeys.myQuestions(profileId) : null,
        () => getQuestionsByAuthor(profileId!)
    )
    return { data: data?.data ?? null, error: data?.error ?? (error ? String(error) : null), isLoading, refetch: mutate }
}