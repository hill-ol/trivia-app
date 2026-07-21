'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X, Plus, Loader2 } from 'lucide-react'
import { renameCategory, deleteCategory, createCategory } from '@/lib/categories'
import { useCategories } from '@/hooks/useCategories'
import { useIsMounted } from '@/hooks/useIsMounted'
import { Card } from '@/components/ui/Card'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { Category } from '@/types'
import { cn } from '@/lib/utils'

const DOT_COLOR: Record<Category['color'], string> = {
    blue: 'bg-marina',
    lavender: 'bg-petal-plush',
    green: 'bg-bowser-shell',
    rose: 'bg-briar-rose',
}

export default function CategoriesPage() {
    const isMounted = useIsMounted()
    const { data: categories, error, isLoading, refetch } = useCategories()

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [newName, setNewName] = useState('')
    const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    const startEditing = (category: Category) => {
        setEditingId(category.id)
        setEditValue(category.name)
        setRowError(null)
    }

    const saveEdit = async () => {
        if (isSaving) return
        if (!editingId || !editValue.trim()) return

        setIsSaving(true)
        const { error } = await renameCategory(editingId, editValue)
        if (!isMounted()) return
        setIsSaving(false)

        if (error) {
            setRowError({ id: editingId, message: error })
            return
        }
        setEditingId(null)
        setRowError(null)
    }

    const handleDelete = async (category: Category) => {
        if (deletingId) return

        setDeletingId(category.id)
        const { error } = await deleteCategory(category.id)
        if (!isMounted()) return
        setDeletingId(null)

        if (error) {
            setRowError({ id: category.id, message: error })
            return
        }
        setConfirmingId(null)
    }

    const handleCreate = async () => {
        if (isCreating) return
        if (!newName.trim()) return

        setIsCreating(true)
        const { error } = await createCategory(newName)
        if (!isMounted()) return
        setIsCreating(false)

        if (error) {
            setRowError({ id: 'new', message: error })
            return
        }
        setNewName('')
        setRowError(null)
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <h1 className="font-display text-2xl text-ink">Categories</h1>
            </div>

            {error && !categories ? (
                <ErrorNotice message="Couldn't load your categories." onRetry={refetch} />
            ) : (
                <div className="flex flex-col gap-3">
                    {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

                    {categories?.map((category) => (
                        <Card key={category.id}>
                            <div className="flex items-center gap-3">
                                <span className={cn('h-3 w-3 shrink-0 rounded-full', DOT_COLOR[category.color])} aria-hidden="true" />
                                {editingId === category.id ? (
                                    <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        autoFocus
                                        disabled={isSaving}
                                        className="min-w-0 flex-1 border-none bg-transparent p-0 text-ink outline-none disabled:opacity-50"
                                    />
                                ) : (
                                    <span className="min-w-0 flex-1 truncate text-ink">{category.name}</span>
                                )}

                                {editingId === category.id ? (
                                    <>
                                        <button
                                            onClick={saveEdit}
                                            disabled={isSaving}
                                            aria-label="Save"
                                            className="cursor-pointer text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            disabled={isSaving}
                                            aria-label="Cancel"
                                            className="cursor-pointer text-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : confirmingId === category.id ? (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-briar-rose">Delete?</span>
                                        <button
                                            onClick={() => handleDelete(category)}
                                            disabled={deletingId === category.id}
                                            className="flex cursor-pointer items-center gap-1 font-medium text-briar-rose underline disabled:cursor-not-allowed"
                                        >
                                            {deletingId === category.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
                                        </button>
                                        <button
                                            onClick={() => setConfirmingId(null)}
                                            disabled={deletingId === category.id}
                                            className="cursor-pointer text-ink-muted disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEditing(category)}
                                            disabled={deletingId !== null}
                                            aria-label="Rename"
                                            className="cursor-pointer text-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setConfirmingId(category.id)}
                                            disabled={deletingId !== null}
                                            aria-label="Delete"
                                            className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            {rowError?.id === category.id && <p className="mt-2 text-xs text-briar-rose">{rowError.message}</p>}
                        </Card>
                    ))}

                    <Card className="flex items-center gap-3">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New category name"
                            disabled={isCreating}
                            className="min-w-0 flex-1 border-none bg-transparent p-0 text-ink outline-none placeholder:text-wild-hillside disabled:opacity-50"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            aria-label="Add category"
                            className="cursor-pointer text-marina disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        </button>
                    </Card>
                    {rowError?.id === 'new' && <p className="text-xs text-briar-rose">{rowError.message}</p>}
                </div>
            )}
        </div>
    )
}