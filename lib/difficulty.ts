import { Question } from '@/types'

export function difficultyChipColor(difficulty: Question['difficulty']) {
    if (difficulty === 'easy') return 'green' as const
    if (difficulty === 'medium') return 'lavender' as const
    return 'rose' as const
}