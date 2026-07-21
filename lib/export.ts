import { supabase } from '@/lib/supabase'

export async function exportAllData(): Promise<{ error: string | null }> {
    const [categoriesResult, questionsResult] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('questions').select('*'),
    ])

    if (categoriesResult.error) return { error: categoriesResult.error.message }
    if (questionsResult.error) return { error: questionsResult.error.message }

    const exportData = {
        exportedAt: new Date().toISOString(),
        categories: categoriesResult.data,
        questions: questionsResult.data,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trivia-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { error: null }
}