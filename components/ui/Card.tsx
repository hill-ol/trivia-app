import { cn } from '@/lib/utils'
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn('rounded-2xl border border-gray-200 bg-white p-4', className)}
            {...props}
        >
            {children}
        </div>
    )
}