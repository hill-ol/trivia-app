interface ChoiceLike {
    text: string
}

export function getMissingFieldMessage(
    questionText: string,
    choices: ChoiceLike[],
    correctId: string | null,
    selectedCategoryId: string | null,
): string {
    if (!questionText.trim()) return 'Add a question first!'
    if (!choices.every((c) => c.text.trim().length > 0)) return 'Fill in all the choices!'
    if (correctId === null) return 'Mark which choice is correct!'
    if (!selectedCategoryId) return 'Pick a category!'
    return ''
}