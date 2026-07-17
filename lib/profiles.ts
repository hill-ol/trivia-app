import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

interface ProfileRow {
    id: string
    name: string
    avatar_url: string | null
}

function toProfile(row: ProfileRow): Profile {
    return { id: row.id, name: row.name, avatarUrl: row.avatar_url ?? undefined }
}

export async function getAllProfiles(): Promise<{ data: Profile[]; error: string | null }> {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) {
        console.error('Failed to load profiles:', error.message)
        return { data: [], error: error.message }
    }
    return { data: (data as ProfileRow[]).map(toProfile), error: null }
}

export async function getOtherProfile(
    currentId: Profile['id']
): Promise<{ data: Profile | undefined; error: string | null }> {
    const { data: profiles, error } = await getAllProfiles()
    if (error) return { data: undefined, error }
    return { data: profiles.find((p) => p.id !== currentId), error: null }
}