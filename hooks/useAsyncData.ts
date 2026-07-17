'use client'

import { useEffect, useState } from 'react'

interface AsyncState<T> {
    data: T | null
    error: string | null
    isLoading: boolean
}

export function useAsyncData<T>(
    fetcher: () => Promise<{ data: T; error: string | null }>,
    deps: React.DependencyList
): AsyncState<T> & { refetch: () => void } {
    const [refetchIndex, setRefetchIndex] = useState(0)
    const key = JSON.stringify([...deps, refetchIndex])

    const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, isLoading: true })
    const [lastKey, setLastKey] = useState(key)

    if (key !== lastKey) {
        setLastKey(key)
        setState({ data: null, error: null, isLoading: true })
    }

    useEffect(() => {
        let cancelled = false
        fetcher().then((result) => {
            if (!cancelled) setState({ ...result, isLoading: false })
        })
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    return { ...state, refetch: () => setRefetchIndex((i) => i + 1) }
}