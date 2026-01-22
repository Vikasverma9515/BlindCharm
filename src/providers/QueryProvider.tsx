'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Aggressive caching for a "fast" feel
                        staleTime: process.env.NODE_ENV === 'development' ? 1000 * 60 : 1000 * 60 * 5, // 1 min (dev) vs 5 mins (prod)
                        gcTime: process.env.NODE_ENV === 'development' ? 1000 * 60 * 5 : 1000 * 60 * 30, // 5 mins (dev) vs 30 mins (prod)
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
