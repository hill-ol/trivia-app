export const cacheKeys = {
    categories: 'categories',
    playData: (profileId: string) => ['play-data', profileId] as const,
    myQuestions: (profileId: string) => ['my-questions', profileId] as const,
    stats: (profileId: string) => ['stats', profileId] as const,
    leaderboard: 'leaderboard',
}