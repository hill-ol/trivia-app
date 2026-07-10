import { Profile, Question } from '@/types'

export const mockProfiles: Profile[] = [
    { id: 'p1', name: 'You' },
    { id: 'p2', name: 'Her' },
]

export const mockQuestions: Question[] = [
    {
        id: 'q1',
        authorId: 'p2',
        visibleToId: 'p1',
        questionText: 'Where did we go on our first date?',
        choices: ['The diner on 5th', 'The Italian place', 'The park', 'The movies'],
        correctAnswer: 'The diner on 5th',
        category: 'first date',
        difficulty: 'easy',
    },
]