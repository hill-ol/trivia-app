import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type StatCardColor = 'blue' | 'lavender'

interface StatCardProps {
    icon: ReactNode
    label: string
    value: string | number
    color?: StatCardColor
    sticker?: 'marina' | 'petal-plush'
}

const iconBgMap: Record<StatCardColor, string> = {
    blue: 'bg-marina/10 text-marina',
    lavender: 'bg-petal-plush/15 text-petal-plush-deep',
}

export function StatCard({ icon, label, value, color = 'blue', sticker }: StatCardProps) {
    return (
        <Card sticker={sticker} rotate={color === 'blue' ? -4 : 4}>
            <div className={cn('mb-2 flex h-6 w-6 items-center justify-center rounded-md', iconBgMap[color])}>
                {icon}
            </div>
            <p className="text-xs text-ink-muted">{label}</p>
            <p className="text-2xl font-medium text-ink">{value}</p>
        </Card>
    )
}