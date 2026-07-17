export const POINT_VALUES = [100, 200, 300, 400, 500] as const
export type PointValue = (typeof POINT_VALUES)[number]

export function pointsChipColor(points: PointValue): 'blue' | 'lavender' | 'green' | 'rose' {
    if (points <= 100) return 'green'
    if (points <= 200) return 'blue'
    if (points <= 300) return 'lavender'
    return 'rose'
}