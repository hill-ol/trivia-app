'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react'
import { getAllCategories, createCategory, renameCategory, deleteCategory } from '@/lib/categories'
import { useAsyncData } from '@/hooks/useAsyncData'
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
    const { data: categories, error, isLoading, refetch } = useAsyncData(getAllCategories, [])
    const [localCategories, setLocalCategories] = useState<Category[] | null>(null)
    const displayCategories = localCategories ?? categories

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [newName, setNewName] = useState('')
    const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)

    const startEditing = (category: Category) => {
        setEditingId(category.id)
        setEditValue(category.name)
        setRowError(null)
    }

    const saveEdit = async () => {
        if (!editingId || !editValue.trim()) return
        const { error } = await renameCategory(editingId, editValue)
        if (error) {
            setRowError({ id: editingId, message: error })
            return
        }
        setLocalCategories((prev) =>
            (prev ?? categories ?? []).map((c) => (c.id === editingId ? { ...c, name: editValue.trim() } : c))
        )
        setEditingId(null)
        setRowError(null)
    }

    const handleDelete = async (category: Category) => {
        const { error } = await deleteCategory(category.id)
        if (error) {
            setRowError({ id: category.id, message: error })
            return
        }
        setLocalCategories((prev) => (prev ?? categories ?? []).filter((c) => c.id !== category.id))
    }

    const handleCreate = async () => {
        if (!newName.trim()) return
        const { category, error } = await createCategory(newName)
        if (error) {
            setRowError({ id: 'new', message: error })
            return
        }
        if (category) {
            setLocalCategories((prev) => [...(prev ?? categories ?? []), category])
            setNewName('')
            setRowError(null)
        }
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <h1 className="font-display text-2xl text-ink">Categories</h1>
            </div>

            {error && !displayCategories ? (
                <ErrorNotice message="Couldn't load your categories." onRetry={refetch} />
            ) : (
                <div className="flex flex-col gap-3">
                    {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

                    {displayCategories?.map((category) => (
                        <Card key={category.id}>
                            <div className="flex items-center gap-3">
                                <span className={cn('h-3 w-3 shrink-0 rounded-full', DOT_COLOR[category.color])} aria-hidden="true" />
                                {editingId === category.id ? (
                                    <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        autoFocus
                                        className="min-w-0 flex-1 border-none bg-transparent p-0 text-ink outline-none"
                                    />
                                ) : (
                                    <span className="flex-1 text-ink">{category.name}</span>
                                )}

                                {editingId === category.id ? (
                                    <>
                                        <button onClick={saveEdit} aria-label="Save" className="cursor-pointer text-ink">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setEditingId(null)} aria-label="Cancel" className="cursor-pointer text-ink-muted">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEditing(category)} aria-label="Rename" className="cursor-pointer text-ink-muted">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(category)} aria-label="Delete" className="cursor-pointer text-ink-muted">
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
                            className="min-w-9 flex-1 border-none bg-transparent p-0 text-ink outline-none placeholder:text-wild-hillside"
                        />
                        <button onClick={handleCreate} aria-label="Add category" className="cursor-pointer text-marina">
                            <Plus className="h-5 w-5" />
                        </button>
                    </Card>
                    {rowError?.id === 'new' && <p className="text-xs text-briar-rose">{rowError.message}</p>}
                </div>
            )}
        </div>
    )
}