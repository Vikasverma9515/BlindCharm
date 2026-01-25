import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 5;

export const useExploreFeed = (userId: string, interestedIn: string[] = ['everyone']) => {
    return useInfiniteQuery({
        queryKey: ['exploreFeed', userId, interestedIn],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            // Fetch from queue API
            const response = await fetch('/api/galaxy/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: PAGE_SIZE })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch queue');
            }

            const data = await response.json();

            return {
                cards: data.profiles || [],
                nextOffset: data.hasMore ? pageParam + 1 : null
            };
        },
        getNextPageParam: (lastPage: any) => {
            return lastPage.nextOffset;
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
};
