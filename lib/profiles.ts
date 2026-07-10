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

export async function getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) {
        console.error('Failed to load profiles:', error.message)
        return []
    }
    return (data as ProfileRow[]).map(toProfile)
}

export async function getOtherProfile(currentId: Profile['id']): Promise<Profile | undefined> {
    const profiles = await getAllProfiles()
    return profiles.find((p) => p.id !== currentId)
}