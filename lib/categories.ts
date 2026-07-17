import { supabase } from '@/lib/supabase'
import { Category } from '@/types'

const COLOR_ROTATION: Category['color'][] = ['blue', 'lavender', 'green', 'rose']

export async function getAllCategories(): Promise<{ data: Category[]; error: string | null }> {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) {
        console.error('Failed to load categories:', error.message)
        return { data: [], error: error.message }
    }
    return { data: data as Category[], error: null }
}

export async function createCategory(
    name: string
): Promise<{ category: Category | null; error: string | null }> {
    const { data: existing } = await getAllCategories()
    const color = COLOR_ROTATION[existing.length % COLOR_ROTATION.length]

    const { data, error } = await supabase
        .from('categories')
        .insert({ name: name.trim(), color })
        .select()
        .single()

    if (error) {
        const message = error.code === '23505' ? 'That category already exists' : error.message
        return { category: null, error: message }
    }
    return { category: data as Category, error: null }
}

export async function renameCategory(id: string, name: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', id)
    if (error) {
        const message = error.code === '23505' ? 'That name is already used by another category' : error.message
        return { error: message }
    }
    return { error: null }
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
        const message =
            error.code === '23503'
                ? 'This category still has questions in it. Move or delete those first.'
                : error.message
        return { error: message }
    }
    return { error: null }
}