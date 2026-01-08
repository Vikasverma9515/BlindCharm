'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { FilterState } from '@/components/discovery/DiscoveryFilters';

interface DiscoveryContextType {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
}

// Default Filters
const defaultFilters: FilterState = {
    interestedIn: ['everyone'],
    minAge: 18,
    maxAge: 50,
    maxDistance: 100,
    minHeight: 150,
    maxHeight: 220,
    verifiedOnly: false,
};

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(undefined);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <DiscoveryContext.Provider value={{ filters, setFilters, isFilterOpen, setIsFilterOpen }}>
            {children}
        </DiscoveryContext.Provider>
    );
}

export function useDiscovery() {
    const context = useContext(DiscoveryContext);
    if (context === undefined) {
        throw new Error('useDiscovery must be used within a DiscoveryProvider');
    }
    return context;
}
