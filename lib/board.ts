import { Category, Question } from '@/types'
import { POINT_VALUES, PointValue } from '@/lib/points'

export interface BoardCell {
    points: PointValue
    question: Question | null
}

export interface BoardColumn {
    category: Category
    cells: BoardCell[]
}

export function buildBoard(questions: Question[]): BoardColumn[] {
    const categories = Array.from(new Map(questions.map((q) => [q.category.id, q.category])).values())

    return categories.map((category) => ({
        category,
        cells: POINT_VALUES.map((points) => ({
            points,
            question: questions.find((q) => q.category.id === category.id && q.points === points) ?? null,
        })),
    }))
}