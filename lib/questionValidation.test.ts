import { describe, it, expect } from 'vitest'
import { getMissingFieldMessage } from './questionValidation'

describe('getMissingFieldMessage', () => {
    const validChoices = [{ text: 'A' }, { text: 'B' }]

    it('flags missing question text first, even if other fields are also missing', () => {
        expect(getMissingFieldMessage('', [], null, null)).toBe('Add a question first!')
    })

    it('flags an empty choice before checking for a correct answer', () => {
        const choices = [{ text: 'A' }, { text: '' }]
        expect(getMissingFieldMessage('Some question', choices, null, null)).toBe('Fill in all the choices!')
    })

    it('flags a missing correct answer before checking category', () => {
        expect(getMissingFieldMessage('Some question', validChoices, null, null)).toBe('Mark which choice is correct!')
    })

    it('flags a missing category last', () => {
        expect(getMissingFieldMessage('Some question', validChoices, 'choice-1', null)).toBe('Pick a category!')
    })

    it('returns an empty string once everything is filled in', () => {
        expect(getMissingFieldMessage('Some question', validChoices, 'choice-1', 'cat-1')).toBe('')
    })
})