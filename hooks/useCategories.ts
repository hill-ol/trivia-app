import useSWR from 'swr'
import { getAllCategories } from "@/lib/categories";
import { cacheKeys } from '@/lib/cacheKeys'

export function useCategories() {
    const { data, error, isLoading, mutate } = useSWR(cacheKeys.categories, () => getAllCategories())
    return { data: data?.data ?? null, error: data?.error ?? (error ? String(error) : null), isLoading, refetch: mutate }
}