import { AlertCircle } from 'lucide-react'

export function ErrorNotice({ message, onRetry }: { message?: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-briar-rose/30 bg-briar-rose/5 p-6 text-center">
            <AlertCircle className="h-5 w-5 text-briar-rose" aria-hidden="true" />
            <p className="text-sm text-briar-rose">{message ?? "Something went wrong loading this."}</p>
            <button onClick={onRetry} className="cursor-pointer text-sm font-medium text-marina underline">
                Try again
            </button>
        </div>
    )
}